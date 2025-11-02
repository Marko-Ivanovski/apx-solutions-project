import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonrepair } from "jsonrepair";

const JSON_START = /[{[]/;
import { assertResumePayload, ResumePayload } from "./schema";
import { buildResumePrompt } from "./prompts";

const MODEL_NAME = "gemini-2.5-flash";
const API_VERSION = "v1";

const FALLBACKS = {
  name: "No name provided.",
  email: "No email provided.",
  phone: "No phone number provided.",
  education: "No education information found.",
  skills: "No skills provided.",
  projects: {
    title: "Information not available",
    summary: "No project information provided.",
  },
  summary: "No experience summary provided.",
} as const;

const INVALID_RESUME_RESPONSE: ResumePayload = {
  name: "Not provided",
  email: "Not provided",
  phone: "Not provided",
  education: ["Information not available"],
  skills: ["Information not available"],
  projects: [
    {
      title: "Information not available",
      summary: "No project information provided.",
    },
  ],
  experience_summary: "This document does not appear to be a valid resume.",
};

function extractJsonBlock(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed.replace(/\r?\n/g, " ").trim();
  }

  const lines = trimmed.split("\n");
  lines.shift();

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
  const normalizedOutput = extractJsonBlock(output);

  try {
    const parsed = safeParseJson(normalizedOutput);
    return normalizeResumePayload(parsed);
  } catch (error) {
    throw new Error("Please try again with a Resume format.");
  }
}

function safeParseJson(payload: string) {
  try {
    return JSON.parse(payload);
  } catch {
    try {
      const cleaned = stripNonJsonPrefix(payload);
      const repaired = jsonrepair(cleaned);
      return JSON.parse(repaired);
    } catch {
      throw new Error("Unable to parse structured resume data.");
    }
  }
}

function stripNonJsonPrefix(payload: string): string {
  const trimmed = payload.trim();
  if (JSON_START.test(trimmed[0] ?? "")) {
    return trimmed;
  }

  const startIndex = trimmed.search(JSON_START);
  if (startIndex === -1) {
    return trimmed;
  }
  return trimmed.slice(startIndex);
}

function normalizeResumePayload(raw: unknown): ResumePayload {
  const sanitized = sanitizeRawResume(raw);

  const missingCoreDetails =
    sanitized.name === FALLBACKS.name &&
    sanitized.email === FALLBACKS.email &&
    sanitized.phone === FALLBACKS.phone &&
    sanitized.education.length === 1 &&
    sanitized.education[0] === FALLBACKS.education &&
    sanitized.skills.length === 1 &&
    sanitized.skills[0] === FALLBACKS.skills &&
    sanitized.projects.length === 1 &&
    sanitized.projects[0].title === FALLBACKS.projects.title &&
    sanitized.projects[0].summary === FALLBACKS.projects.summary;

  const summaryLower = sanitized.experience_summary.toLowerCase();
  const explicitlyInvalid = summaryLower.includes("does not appear to be a valid resume");

  if (explicitlyInvalid || missingCoreDetails) {
    return INVALID_RESUME_RESPONSE;
  }

  return assertResumePayload(sanitized);
}

function sanitizeRawResume(raw: unknown) {
  const data = (raw ?? {}) as Record<string, unknown>;

  const name = normalizeString(data.name, FALLBACKS.name, 2);
  const email = normalizeString(data.email, FALLBACKS.email, 5);
  const phone = normalizeString(data.phone, FALLBACKS.phone, 5);
  const education = normalizeArray(data.education, FALLBACKS.education);
  const skills = normalizeArray(data.skills, FALLBACKS.skills);
  const projects = normalizeProjects(data.projects);
  const experienceSummary = normalizeString(data.experience_summary, FALLBACKS.summary, 30);

  return {
    name,
    email,
    phone,
    education,
    skills,
    projects,
    experience_summary: experienceSummary,
  };
}

function normalizeString(value: unknown, fallback: string, minLength = 1): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length >= minLength) {
      return trimmed;
    }
  }
  return fallback;
}

function normalizeArray(value: unknown, fallback: string): string[] {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);

    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  return [fallback];
}

function normalizeProjects(value: unknown): ResumePayload["projects"] {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => {
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const title = normalizeString(record.title, FALLBACKS.projects.title, 1);
          const summary = normalizeString(record.summary, FALLBACKS.projects.summary, 10);
          return { title, summary };
        }
        if (typeof item === "string") {
          const title = normalizeString(item, FALLBACKS.projects.title, 1);
          return { title, summary: FALLBACKS.projects.summary };
        }
        return null;
      })
      .filter((item): item is { title: string; summary: string } => item !== null);

    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  return [FALLBACKS.projects];
}
