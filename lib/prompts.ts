const SYSTEM_PROMPT = "You are an AI resume parser that extracts structured candidate information.";

const USER_PROMPT_TEMPLATE = `
From this resume text, return pure JSON with the following fields:
- name: string
- email: string
- phone: string
- education: string[]
- skills: string[]
- projects: { title: string; summary: string(1-2 sentences) }[]
- experience_summary: string (3-5 sentences)
The response must be valid JSON only, without commentary or markdown.

Rules:
- If a field is missing or unclear, provide a helpful fallback message such as "No phone number provided" or "No project details listed."
- Always return non-empty arrays for education, skills, and projects. Use a single descriptive project object with a clear title and summary when the resume lacks that section.
- If the document is not a resume or contains irrelevant content, return:
  {
    "name": "Not provided",
    "email": "Not provided",
    "phone": "Not provided",
    "education": ["Information not available"],
    "skills": ["Information not available"],
    "projects": [
      {
        "title": "Information not available",
        "summary": "No project information provided."
      }
    ],
    "experience_summary": "This document does not appear to be a valid resume."
  }
- Never include code fences, markdown, or explanatory text. Return JSON only.

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
