// utils/aiApi.ts

/**
 * Utility functions to interact with the Gemini Nano AI API.
 */

export type Capabilities = {
  available: string; // Indicates model availability (e.g., "readily", "no").
  defaultTemperature: number; // Default temperature for model responses.
  defaultTopK: number; // Default top-K sampling value.
  maxTopK: number; // Maximum top-K sampling value.
};

export type SessionOptions = {
  temperature?: number; // Optional temperature for the session.
  topK?: number; // Optional top-K sampling value for the session.
  systemPrompt?: string; // Optional system prompt for the session.
  monitor?: (event: Event) => void; // Optional event monitor for session progress.
};

/**
 * Fetches the capabilities of the Gemini Nano model.
 */
export async function checkCapabilities(): Promise<Capabilities> {
  try {
    const capabilities = await ai.languageModel.capabilities();
    console.log("Gemini Nano capabilities fetched:", capabilities);
    return capabilities;
  } catch (error) {
    console.error("Error fetching Gemini Nano capabilities:", error);
    throw new Error("Failed to fetch Gemini Nano capabilities.");
  }
}

/**
 * Creates a session for interacting with the Gemini Nano language model.
 * @param options Optional configuration for the session.
 */
export async function createSession(options: SessionOptions = {}) {
  try {
    const session = await ai.languageModel.create(options);
    console.log("Session created successfully:", session);
    return session;
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create a session with Gemini Nano.");
  }
}

/**
 * Sends a prompt to the Gemini Nano model and fetches the complete response.
 * @param session The session created with `createSession`.
 * @param prompt The input text for the model.
 */
export async function promptModel(session: any, prompt: string): Promise<string> {
  try {
    const result = await session.prompt(prompt);
    console.log("Model response:", result);

    // Ensure model response is concise and mapped to "Yes" or "No"
    const lowerCased = result.toLowerCase();
    if (lowerCased.includes("yes")) return "Yes";
    if (lowerCased.includes("no")) return "No";

    // Default fallback if response is unexpected
    return "Unknown";
  } catch (error: any) {
    if (error.name === "NotSupportedError") {
      console.error("NotSupportedError: The model attempted an unsupported operation.", error);
      throw new Error("The model attempted to output text in an unsupported language or format.");
    } else {
      console.error("Error prompting model:", error);
      throw new Error("Failed to get a response from the Gemini Nano model.");
    }
  }
}

