import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AssistantRequest, AssistantResponse } from "@/lib/types";
import { detectIntent, parseResponse } from "@/lib/assistant-utils";
import { logInteraction } from "@/lib/google-logger";

/**
 * Interface mapping for the Google Gemini discovery API response.
 */
interface GoogleModelDiscovery {
  models?: Array<{
    name: string;
    supportedGenerationMethods: string[];
  }>;
  error?: {
    message: string;
  };
}

// genAI initialized dynamically inside handler
const SYSTEM_PROMPT = `You are CivicPulse, an intelligent, friendly, and non-partisan election assistant for Indian voters.
Your role is to help citizens navigate the voting process step-by-step according to the Election Commission of India (ECI) guidelines.

You help with:
- Checking voter eligibility (age ≥18 as of Jan 1, Indian citizenship, ordinary residency, enrolled in part of electoral roll)
- Verifying registration status (EPIC card) on the Voter Portal / NVSP
- Finding polling booths and timings (typically 7 AM to 6 PM)
- Understanding election deadlines, Form 6, Form 8, and timelines
- Factually answering questions about ECI procedures, EVMs, and VVPATs.

Tone: Official, clear, encouraging, accessible. Never partisan. Always cite that users should verify info with voters.eci.gov.in.

When you detect the user's intent, classify it as one of: CHECK_ELIGIBILITY, VERIFY_REGISTRATION, FIND_POLLING_PLACE, DEADLINE_QUERY, or GENERAL.

Keep responses concise (2-4 sentences). Always end with 1-3 follow-up suggestions as a JSON array after your main response.

Response format (ALWAYS follow this):
REPLY: <your response>
INTENT: <one of the intent types>
SUGGESTIONS: <JSON array of 2-3 short follow-up questions>`;

// Assistant Logic Utils extracted to lib/assistant-utils.ts

/**
 * POST handler for the CivicPulse AI Assistant.
 * Routes user queries to Google Gemini, performing dynamic model discovery if the primary model is unavailable.
 */
export async function POST(req: NextRequest) {
  try {
    const body: AssistantRequest = await req.json();
    const { message, history, userState } = body;
    const detectedIntent = detectIntent(message);

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({ 
        error: "Assistant unavailable: Invalid API Key configuration." 
      }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const contextualSystem = `${SYSTEM_PROMPT}\n\nCurrent user voter state: ${userState}\nDetected intent: ${detectedIntent}`;
    
    // Map history to Google-compatible parts
    const chatHistory = history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));

    /**
     * Helper to execute a chat message using a specific model name.
     */
    const executeChat = async (mName: string): Promise<string> => {
      const model = genAI.getGenerativeModel({ 
        model: mName,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        ]
      }, { apiVersion: "v1" });
      
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: contextualSystem }] },
          { role: "model", parts: [{ text: "Understood. I am CivicPulse, ready to assist voters." }] },
          ...chatHistory,
        ],
      });
      
      const result = await chat.sendMessage(message);
      return result.response.text();
    };

    let raw = "";
    const primaryModel = "gemini-1.5-flash";

    try {
      raw = await executeChat(primaryModel);
    } catch (err) {
      const errorStr = err instanceof Error ? err.message : String(err);
      
      // Fallback Discovery Logic
      if (errorStr.toLowerCase().includes("404") || errorStr.toLowerCase().includes("not found")) {
        console.warn(`Primary model ${primaryModel} not found. Running discovery.`);
        
        try {
          const mRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
          const mData: GoogleModelDiscovery = await mRes.json();
          
          if (mData.error) throw new Error(mData.error.message);

          const availableModels = mData.models
            ?.filter((m) => m.supportedGenerationMethods.includes("generateContent"))
            .map((m) => m.name.replace("models/", "")) || [];

          for (const discoveredModel of availableModels) {
            try {
              raw = await executeChat(discoveredModel);
              if (raw) break;
            } catch {
              continue;
            }
          }
        } catch (discErr) {
          console.error("Discovery failed critically:", discErr);
          throw err; 
        }
      } else {
        throw err;
      }
    }

    if (!raw) {
      return NextResponse.json({ error: "AI failed to generate a response." }, { status: 502 });
    }

    const parsed = parseResponse(raw);
    
    // Background analytics logging
    logInteraction({
      message,
      intent: parsed.intent ?? detectedIntent,
      timestamp: new Date().toISOString()
    }).catch(e => console.error("Logging error:", e));

    return NextResponse.json<AssistantResponse>(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Assistant API]", message);
    return NextResponse.json({ error: "AI Assistant is currently offline." }, { status: 500 });
  }
}
