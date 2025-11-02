"use client";

import type { ResumePayload } from "@/lib/schema";

type ResultsCardProps = {
  resume: ResumePayload;
  onReset?: () => void;
};

export function ResultsCard({ resume, onReset }: ResultsCardProps) {
  return (
    <section className="flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-emerald-200 bg-white/90 p-8 shadow-sm backdrop-blur">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-600">Parsed successfully</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">{resume.name}</h2>
          <div className="mt-2 flex flex-col gap-1 text-sm text-zinc-500">
            <span>{resume.email}</span>
            <span>{resume.phone}</span>
          </div>
        </div>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Parse another resume
          </button>
        ) : null}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-2xl bg-emerald-50/60 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Education</h3>
          <ul className="space-y-2 text-sm text-zinc-700">
            {resume.education.map((entry) => (
              <li key={entry} className="rounded-lg bg-white/60 px-3 py-2 shadow-sm">
                {entry}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-emerald-50/60 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Skills</h3>
          <ul className="flex flex-wrap gap-2 text-sm text-zinc-700">
            {resume.skills.map((skill) => (
              <li key={skill} className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Projects</h3>
        <div className="space-y-3 text-sm text-zinc-700">
          {resume.projects.map((project) => (
            <article key={`${project.title}-${project.summary}`} className="rounded-2xl border border-emerald-100 bg-white/80 p-3 shadow-sm">
              <h4 className="text-sm font-semibold text-emerald-700">{project.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{project.summary}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Experience Summary</h3>
        <p className="text-sm leading-relaxed text-zinc-700">{resume.experience_summary}</p>
      </div>
    </section>
  );
}

export default ResultsCard;
