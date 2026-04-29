import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssistantRequest, AssistantResponse, Intent } from "@/lib/types";

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

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  if (lower.includes("eligib") || lower.includes("qualify") || lower.includes("can i vote")) return "CHECK_ELIGIBILITY";
  if (lower.includes("register") || lower.includes("registration")) return "VERIFY_REGISTRATION";
  if (lower.includes("polling") || lower.includes("poll") || lower.includes("where") || lower.includes("location")) return "FIND_POLLING_PLACE";
  if (lower.includes("deadline") || lower.includes("when") || lower.includes("date") || lower.includes("time")) return "DEADLINE_QUERY";
  return "GENERAL";
}

function parseResponse(raw: string): { reply: string; intent: Intent; suggestions: string[] } {
  const replyMatch = raw.match(/REPLY:\s*([\s\S]*?)(?=INTENT:|$)/);
  const intentMatch = raw.match(/INTENT:\s*(\w+)/);
  const suggestionsMatch = raw.match(/SUGGESTIONS:\s*(\[[\s\S]*?\])/);

  const reply = replyMatch?.[1]?.trim() ?? raw;
  const intent = (intentMatch?.[1] as Intent) ?? "GENERAL";
  let suggestions: string[] = [];
  try {
    suggestions = JSON.parse(suggestionsMatch?.[1] ?? "[]");
  } catch {
    suggestions = ["Am I eligible to vote?", "Where is my polling place?", "What are the registration deadlines?"];
  }
  return { reply, intent, suggestions };
}

export async function POST(req: NextRequest) {
  let message = "";
  try {
    const body: AssistantRequest = await req.json();
    message = body.message;
    const { history, userState } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({ error: "Please provide a valid GEMINI_API_KEY in your .env file." }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 1. Try the most standard model first
    const primaryModel = "gemini-1.5-flash";
    let modelName = primaryModel;
    let model;

    try {
      model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1" });
      // Quick check if model exists? (SDK doesn't verify on init, only on use)
    } catch (e) {
      console.warn("Primary model initialization failed, switching to discovery.");
    }

    const contextualSystem = `${SYSTEM_PROMPT}\n\nCurrent user voter state: ${userState}`;
    const chatHistory = history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));

    const executeChat = async (mName: string) => {
      const m = genAI.getGenerativeModel({ model: mName }, { apiVersion: "v1" });
      const chat = m.startChat({
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
    try {
      raw = await executeChat(modelName);
    } catch (err: any) {
      // 2. Discovery: If primary fails (404), find ANY available text model for this key
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        console.warn(`Model ${modelName} not found using GCP key. Attempting dynamic discovery on v1...`);
        try {
          // Try v1 instead of v1beta for Cloud keys
          const mRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
          const mData = await mRes.json();
          
          if (mData.error) {
            console.error("Discovery API Error:", mData.error);
            throw new Error(mData.error.message || "GCP API Error");
          }

          const availableModels = mData.models
            ?.filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
            .map((m: any) => m.name.replace("models/", "")) || [];
          
          console.info("Discovered Text Models for this key (Terminal Check):", availableModels);

          if (availableModels.length > 0) {
            // Try everything in the discovery list until one works
            for (const bestModel of availableModels) {
              try {
                console.info(`Attempting Discovered Model: ${bestModel}`);
                raw = await executeChat(bestModel);
                if (raw) break;
              } catch (e) {
                console.warn(`Discovered model ${bestModel} also failed, trying next...`);
              }
            }
          } else {
            throw err;
          }
        } catch (discoveryErr: any) {
          console.error("Discovery failed:", discoveryErr.message);
          throw err; 
        }
      } else {
        throw err;
      }
    }

    if (!raw) {
      throw new Error("Could not get a valid response from any AI model.");
    }

    const parsed = parseResponse(raw);
    return NextResponse.json<AssistantResponse>(parsed);
  } catch (error: any) {
    console.error("Assistant API Final Error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "AI is currently unavailable" }, { status: 500 });
  }
}
