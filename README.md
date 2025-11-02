# APX Resume Parser

A Next.js 16 + TypeScript + Tailwind 4 web app that lets recruiters upload a resume PDF and instantly view structured candidate information. The backend extracts text server-side, sends it to Google’s Gemini API for parsing, validates the response with Zod, and renders clean cards for name, email, education, skills, and a short experience summary.

## Features
- Upload any PDF resume with drag-and-drop or file picker.
- Parse resumes via Gemini 2.5 Flash with JSON schema enforcement.
- Defensive fallbacks for missing sections and non-resume documents.
- Responsive Tailwind UI with idle, loading, success, and error states.
- Deployed on Vercel; compatible with `npm run dev`, `npm run lint`, `npm run build`.

## Getting Started
1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env.local` and add your Gemini key
   ```bash
   GOOGLE_GENAI_API_KEY=your-key-here
   ```
3. Run locally
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 and upload a PDF resume.

## API
- `POST /api/parse` – multipart form-data with `file` (PDF). Returns structured resume JSON or a helpful error payload.

## Tests & Quality
- `npm run lint` – type-aware ESLint
- `npm run build` – Next.js production build

## Deployment
- Configured for Vercel; `serverExternalPackages` ensures native PDF support.
