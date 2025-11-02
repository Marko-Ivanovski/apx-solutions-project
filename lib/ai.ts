import { GoogleGenerativeAI } from "@google/generative-ai";
import { assertResumePayload, ResumePayload } from "./schema";
import { buildResumePrompt } from "./prompts";

const MODEL_NAME = "gemini-2.5-flash";
const API_VERSION = "v1";

function extractJsonBlock(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed.replace(/\r?\n/g, " ").trim();
  }

  const lines = trimmed.split("\n");
  // Drop opening fence
  lines.shift();

  // Remove closing fence if present
  const closingIndex = lines.findIndex((line) => line.trim().startsWith("```"));
  if (closingIndex !== -1) {
    lines.splice(closingIndex);
  }

  return lines.join("\n").trim().replace(/\r?\n/g, " ");
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function parseResumeWithGemini(resumeText: string): Promise<ResumePayload> {
  if (!resumeText.trim()) {
    throw new Error("Could not extract text from resume");
  }

  const { systemInstruction, userInstruction } = buildResumePrompt(resumeText);
  const client = getGeminiClient();
  const model = client.getGenerativeModel(
    {
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 2048,
      },
    },
    {
      apiVersion: API_VERSION,
    },
  );

  const combinedPrompt = `${systemInstruction.trim()}\n\n${userInstruction.trim()}`;

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
  });

  const output = response.response.text();
  try {
    const parsed = JSON.parse(extractJsonBlock(output));
    return assertResumePayload(parsed);
  } catch (error) {
    throw new Error("Gemini returned invalid JSON. Please try again with a clearer resume.");
  }
}
