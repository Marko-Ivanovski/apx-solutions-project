"use client";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Parsing resume..." }: LoadingStateProps) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <div className="flex items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" aria-hidden />
      </div>
      <p className="text-sm font-medium text-zinc-900">{message}</p>
      <p className="text-xs text-zinc-500">This usually takes a few seconds.</p>
    </div>
  );
}

export default LoadingState;
