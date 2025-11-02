"use client";

import { useId, useState, type FormEvent } from "react";

type UploadFormProps = {
  onUpload: (file: File) => Promise<void> | void;
  disabled?: boolean;
};

export function UploadForm({ onUpload, disabled = false }: UploadFormProps) {
  const inputId = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("resume") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    if (!file) {
      setLocalError("Please select a PDF resume to upload.");
      return;
    }

    if (file.type !== "application/pdf") {
      setLocalError("Only PDF files are supported.");
      return;
    }

    setLocalError(null);
    await onUpload(file);
    if (form.isConnected) {
      form.reset();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-md max-w-xl"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-xl font-semibold text-zinc-900">
          Upload resume
        </label>
        <p className="text-sm text-zinc-500">
          Drop a PDF resume to extract contact details, education, skills, and experience summary.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          id={inputId}
          name="resume"
          type="file"
          accept="application/pdf"
          disabled={disabled}
          className="block w-full cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100"
        />
        <p className="text-xs text-zinc-500">Maximum size 5MB. We only store the file for parsing.</p>
        {localError ? (
          <p className="text-sm font-medium text-rose-600" role="alert">
            {localError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {disabled ? "Uploading..." : "Parse resume"}
      </button>
    </form>
  );
}

export default UploadForm;
