"use client";

import { useMemo, useState, type ReactNode } from "react";
import ErrorAlert from "@/components/ErrorAlert";
import LoadingState from "@/components/LoadingState";
import ResultsCard from "@/components/ResultsCard";
import UploadForm from "@/components/UplaodForm";
import type { ResumePayload } from "@/lib/schema";

const PARSE_ENDPOINT = "/api/parse";

type ParseStatus = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [result, setResult] = useState<ResumePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const headline = useMemo(() => {
    switch (status) {
      case "success":
        return "Resume parsed successfully";
      case "error":
        return "We ran into an issue";
      case "loading":
        return "Parsing resume";
      default:
        return "AI-powered resume insights in seconds";
    }
  }, [status]);

  const subHeadline = useMemo(() => {
    switch (status) {
      case "success":
        return "Review the structured candidate data below or parse another resume.";
      case "error":
        return "Check the message below, adjust the file if needed, and try again.";
      case "loading":
        return "Hold tight while we extract details and prepare the summary.";
      default:
        return "Upload a PDF resume and we will extract key candidate information automatically.";
    }
  }, [status]);

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  };

  const handleUpload = async (file: File) => {
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(PARSE_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "Could not extract resume data. Please try a different PDF.";
        throw new Error(message);
      }

      setResult(payload as ResumePayload);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error while parsing resume.");
      setStatus("error");
    }
  };

  let content: ReactNode = null;
  if (status === "idle") {
    content = <UploadForm onUpload={handleUpload} disabled={false} />;
  } else if (status === "loading") {
    content = <LoadingState />;
  } else if (status === "success" && result) {
    content = <ResultsCard resume={result} onReset={reset} />;
  } else if (status === "error" && errorMessage) {
    content = <ErrorAlert message={errorMessage} onReset={reset} />;
  } else {
    content = (
      <ErrorAlert message="We could not parse that resume. Please try again." onReset={reset} />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-emerald-50 py-16">
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-6">
        <header className="flex max-w-3xl flex-col gap-4 text-center md:text-left">
          <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">{headline}</h1>
          <p className="text-base text-zinc-600 sm:text-lg">{subHeadline}</p>
        </header>
        {content}
      </main>
    </div>
  );
}
