import { describe, it, expect } from "vitest";
import { detectIntent, parseResponse } from "../lib/assistant-utils";

describe("Assistant Utilities", () => {
  describe("detectIntent", () => {
    it("should detect eligibility intent", () => {
      expect(detectIntent("Am I eligible to vote?")).toBe("CHECK_ELIGIBILITY");
      expect(detectIntent("Can I vote if I am 17?")).toBe("CHECK_ELIGIBILITY");
    });

    it("should detect registration intent", () => {
      expect(detectIntent("How do I register?")).toBe("VERIFY_REGISTRATION");
      expect(detectIntent("registration portal")).toBe("VERIFY_REGISTRATION");
    });

    it("should detect polling place intent", () => {
      expect(detectIntent("where is my booth?")).toBe("FIND_POLLING_PLACE");
      expect(detectIntent("poll location")).toBe("FIND_POLLING_PLACE");
    });

    it("should detect deadline intent", () => {
      expect(detectIntent("voter registration deadline")).toBe("DEADLINE_QUERY");
      expect(detectIntent("when are elections")).toBe("DEADLINE_QUERY");
    });

    it("should fallback to general intent", () => {
      expect(detectIntent("hello assistant")).toBe("GENERAL");
    });
  });

  describe("parseResponse", () => {
    it("should parse standard AI responses", () => {
      const raw = `REPLY: Yes, you can vote. 
INTENT: CHECK_ELIGIBILITY
SUGGESTIONS: ["How to register?", "What docs needed?"]`;
      
      const parsed = parseResponse(raw);
      expect(parsed.reply).toContain("Yes, you can vote");
      expect(parsed.intent).toBe("CHECK_ELIGIBILITY");
      expect(parsed.suggestions).toHaveLength(2);
    });

    it("should handle missing metadata gracefully", () => {
      const raw = "Just a simple reply without tags";
      const parsed = parseResponse(raw);
      expect(parsed.reply).toBe(raw);
      expect(parsed.intent).toBe("GENERAL");
      expect(parsed.suggestions).toHaveLength(3); // Default fallback
    });
  });
});
