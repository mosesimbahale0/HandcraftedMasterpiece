import { createSession, promptModel } from "./ai-utils";


export type ModerationResult = {
  passed: boolean;
  reasons: string[];
};

// Rule-based moderation parameters
const prohibitedKeywords = ["badword", "offensive", "hate"];
const maxLength = 200;

/**
 * Rule-based moderation to check for prohibited content and excessive length.
 */
export function moderateContent(content: string): ModerationResult {
  const reasons: string[] = [];

  // Rule 1: Check for prohibited keywords
  prohibitedKeywords.forEach((word) => {
    if (content.toLowerCase().includes(word)) {
      reasons.push(`Contains prohibited keyword: "${word}"`);
    }
  });

  // Rule 2: Check for excessive length
  if (content.length > maxLength) {
    reasons.push(`Content exceeds maximum length of ${maxLength} characters.`);
  }

  return {
    passed: reasons.length === 0,
    reasons,
  };
}

/**
 * Hybrid moderation that combines rule-based and AI-based validation.
 */
export async function hybridModerateContent(content: string): Promise<ModerationResult> {
  // Step 1: Perform rule-based moderation
  const ruleBasedResult = moderateContent(content);
  if (!ruleBasedResult.passed) return ruleBasedResult;

  // Step 2: AI-based moderation (if rule-based checks pass)
  const session = await createSession();
  const moderationPrompt = `Evaluate the following content for appropriateness: "${content}". 
  If inappropriate, list the reasons why.`;
  const aiResponse = await promptModel(session, moderationPrompt);

  // Parse AI response for moderation results
  const aiReasons: string[] = [];
  if (aiResponse.toLowerCase().includes("inappropriate")) {
    aiReasons.push("AI flagged content as inappropriate.");
  }

  return {
    passed: aiReasons.length === 0,
    reasons: [...ruleBasedResult.reasons, ...aiReasons],
  };
}
