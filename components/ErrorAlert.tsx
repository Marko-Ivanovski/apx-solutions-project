"use client";

type ErrorAlertProps = {
  message: string;
  onReset?: () => void;
};

export function ErrorAlert({ message, onReset }: ErrorAlertProps) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-rose-800">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white"
        >
          !
        </span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold tracking-wide">We could not parse that resume</h2>
          <p className="mt-1 text-sm leading-relaxed">{message}</p>
        </div>
      </div>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="self-start rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-white"
        >
          Try another file
        </button>
      ) : null}
    </div>
  );
}

export default ErrorAlert;
