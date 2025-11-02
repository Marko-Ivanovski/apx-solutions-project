# AGENTS.md

## Purpose

This file tells the Codex agent how to behave when coding inside this project.

---

## Core Role

You are a **coding assistant** working inside a **Next.js 15 + TypeScript + Tailwind 4** project.
Your task: **build, edit, and debug** features for the AI-Powered Resume Parser app.

---

## Coding Rules

* Keep code **simple**, **typed**, and **explainable**.
* Modify **only** the files mentioned in the user prompt.
* Do **not** refactor unrelated code.
* No unnecessary dependencies or libraries.
* Keep imports clean and minimal.
* Always use `async/await` and proper error handling.
* No console clutter.

---

## Output Requirements

* Validate with Zod schema before returning JSON.
* Return structured, valid JSON only.
* Ensure `npm run build` and `npm run lint` pass.

---

## UI Behavior

* Keep Tailwind classes minimal and responsive.
* Use simple cards, loaders, and error banners.
* Follow clean layout and clear state changes.

---

## Communication

When the user gives an instruction:

1. Read the full context.
2. Modify only requested files.
3. Provide unified diffs or complete file replacements.
4. If uncertain, ask for clarification **before applying** big changes.

---

## Goal

Deliver a clean, working web app that:

* Uploads a resume.
* Parses it using Gemini AI.
* Displays structured results clearly.
* Runs and deploys smoothly on **Vercel**.
