const SYSTEM_PROMPT ="You are an AI resume parser that extracts structured candidate information.";

const USER_PROMPT_TEMPLATE = `
From this resume text, return pure JSON with the following fields:
- name: string
- email: string
- education: string[]
- skills: string[]
- experience_summary: string (3-5 sentences)
The response must be valid JSON only, without commentary or markdown.

Resume:
{{RESUME_TEXT}}
`;

export function buildResumePrompt(resumeText: string): {
  systemInstruction: string;
  userInstruction: string;
} {
  return {
    systemInstruction: SYSTEM_PROMPT,
    userInstruction: USER_PROMPT_TEMPLATE.replace("{{RESUME_TEXT}}", resumeText.trim()),
  };
}