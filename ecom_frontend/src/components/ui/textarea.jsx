import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(
  (
    { className, containerClass, label, error, touched, helpText, ...props },
    ref,
  ) => {
    const showError = touched && error;

    return (
      <div className={cn("space-y-1.5 w-full", containerClass)}>
        {/* 🔹 Label styling (matching Input) */}
        {label && (
          <label className="text-xs font-medium text-gray-600">{label}</label>
        )}

        {/* 🔹 Wrapper styling (matching Input's border and focus logic) */}
        <div
          className={cn(
            "flex rounded-lg overflow-hidden transition-all",
            showError
              ? "border border-red-500 bg-red-50"
              : "border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-emerald-500",
            props.disabled && "opacity-60 cursor-not-allowed",
          )}
        >
          <textarea
            ref={ref}
            data-slot="textarea"
            className={cn(
              // Using field-sizing-content for auto-height if supported, or min-h-24 for standard feel
              "flex min-h-[100px] w-full px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-gray-400 disabled:cursor-not-allowed resize-none",
              className,
            )}
            {...props}
          />
        </div>

        {/* 🔴 Error Message */}
        {showError && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            ⚠ {error}
          </p>
        )}

        {/* 🛈 Help Text */}
        {!showError && helpText && (
          <p className="text-xs text-gray-500">{helpText}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
