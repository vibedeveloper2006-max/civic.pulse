import { Intent } from "./types";

/**
 * Intent detection logic for voter queries.
 * Categorizes user messages into specific election-related workflow intents.
 * 
 * @param message - The raw user input string
 * @returns The detected Intent type
 */
export function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  if (lower.includes("eligib") || lower.includes("qualify") || lower.includes("can i vote")) return "CHECK_ELIGIBILITY";
  if (lower.includes("deadline") || lower.includes("when") || lower.includes("date") || lower.includes("time")) return "DEADLINE_QUERY";
  if (lower.includes("register") || lower.includes("registration")) return "VERIFY_REGISTRATION";
  if (lower.includes("polling") || lower.includes("poll") || lower.includes("where") || lower.includes("location")) return "FIND_POLLING_PLACE";
  return "GENERAL";
}

/**
 * Parses the raw AI response containing structured tags into a clean object.
 * 
 * @param raw - The tagged string output from Gemini
 * @returns An object containing the reply text, detected intent, and suggested questions
 */
export function parseResponse(raw: string): { reply: string; intent: Intent; suggestions: string[] } {
  const replyMatch = raw.match(/REPLY:\s*([\s\S]*?)(?=INTENT:|$)/);
  const intentMatch = raw.match(/INTENT:\s*(\w+)/);
  const suggestionsMatch = raw.match(/SUGGESTIONS:\s*(\[[\s\S]*?\])/);

  const reply = replyMatch?.[1]?.trim() ?? raw;
  const intent = (intentMatch?.[1] as Intent) ?? "GENERAL";
  let suggestions: string[] = ["Am I eligible to vote?", "Where is my polling place?", "What are the registration deadlines?"];
  
  if (suggestionsMatch && suggestionsMatch[1]) {
    try {
      const parsed = JSON.parse(suggestionsMatch[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        suggestions = parsed;
      }
    } catch {
      // keep default suggestions
    }
  }
  return { reply, intent, suggestions };
}
