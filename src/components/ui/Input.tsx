import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest " +
  "px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 " +
  "transition-shadow duration-300 " +
  "focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-fixed/40 " +
  "disabled:opacity-50";

type FieldWrapperProps = {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
};

function FieldWrapper({
  label,
  error,
  hint,
  id,
  children,
}: FieldWrapperProps & { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className="font-label-caps text-label-caps uppercase text-on-surface-variant"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="font-body-sm text-body-sm text-error">{error}</p>
      ) : hint ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant/80">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = FieldWrapperProps & InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(fieldBase, error && "border-error focus:ring-error-container", className)}
        {...rest}
      />
    </FieldWrapper>
  );
}

type TextareaProps = FieldWrapperProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, error, hint, className, id, ...rest }: TextareaProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBase,
          "min-h-[120px] resize-y",
          error && "border-error focus:ring-error-container",
          className
        )}
        {...rest}
      />
    </FieldWrapper>
  );
}

export default Input;
