# GUIDELINE.md

## Purpose

This document instructs the Codex Agent on how to correctly build and maintain the **AI-Powered Resume Parser** project for the APX Solutions internship assignment.

The goal: create a **simple full-stack web app** that allows a user to upload a PDF resume, automatically extracts 5 key candidate data points using AI, and displays them cleanly in the UI.

---

## Core Objectives

* Build a complete, functional, and clean **AI-powered resume parser**.
* Stack: **Next.js 15**, **TypeScript**, **Tailwind 4**, **Gemini AI** (free-tier), hosted on **Vercel**.
* Frontend: clean upload UI, loading state, and result display.
* Backend: process uploaded PDF, call Gemini API, validate and return structured JSON.
* Extract 5 fields from each resume:

  1. Name
  2. Email
  3. Education
  4. Skills (list)
  5. Experience Summary (short paragraph)

---

## AI Logic

### Data Flow

1. User uploads a `.pdf` file.
2. API route `/api/parse` validates the file.
3. PDF content is sent to Gemini API with a structured prompt.
4. Gemini returns extracted data in JSON.
5. Backend validates it via **Zod schema** and sends response to frontend.
6. Frontend renders the results.

### Prompt Template (used in `lib/prompts.ts`)

System:

> You are an AI resume parser that extracts structured candidate information.

User:

> From this resume, return JSON with fields: name, email, phone, skills[], and experience_summary (3-5 sentences). Output pure JSON, no comments or markdown.

---

## Rules for Codex Agent

* **Do not refactor globally** unless instructed.
* **Edit only** the files mentioned in the prompt.
* **Preserve structure and naming conventions.**
* **No new dependencies** unless explicitly approved.
* **Always validate JSON output** using the defined Zod schema.
* **Never hardcode sample values.**
* **Avoid large model calls in client-side code.** All AI logic must run server-side.
* **Follow clean code conventions:** clear names, typed functions, no console spam.

---

## API Contract

### Input

```
POST /api/parse
multipart/form-data
file: <PDF>
```

### Output (JSON)

```
{
  "name": "string",
  "email": "string",
  "education": ["string"],
  "skills": ["string"],
  "experience_summary": "string"
}
```

If parsing fails:

```
{
  "error": "Could not extract resume data"
}
```

---

## Acceptance Criteria

* Upload works for any standard PDF resume.
* Shows loading indicator while processing.
* Extracted data appears clearly and correctly.
* Handles invalid or image-only PDFs gracefully.
* Passes lint, type-check, and build.
* Deploys and runs on **Vercel free plan**.

---

## Visual Flow

**UI States:**

1. Idle → Upload card.
2. Loading → Spinner + message.
3. Success → ResultsCard with fields.
4. Error → ErrorAlert with reason.

**Design principle:** minimal, readable, and professional.

---

## .env.local

```
GOOGLE_GENAI_API_KEY=
```

---

## Summary for Codex Agent

Your goal is to **implement**, **debug**, and **maintain** this project following the structure above.

Always:

1. Keep code minimal and explainable.
2. Modify only what’s necessary.
3. Validate outputs against schema.
4. Ensure frontend and backend stay in sync.

If uncertain: ask for clarification before applying large changes.
