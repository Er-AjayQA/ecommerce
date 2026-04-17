import * as React from "react";
import { cn } from "@/lib/utils";

// Using forwardRef to maintain consistency with Input 1's ability to be used with refs
const Input = React.forwardRef(
  (
    {
      className,
      containerClass,
      type,
      label,
      error,
      touched,
      helpText,
      prefix,
      suffix,
      onSuffixClick,
      ...props
    },
    ref,
  ) => {
    const showError = touched && error;

    return (
      <div className={cn("space-y-1.5 w-full", containerClass)}>
        {/* 🔹 Label styling from Input 1 */}
        {label && (
          <label className="text-xs font-medium text-gray-600">{label}</label>
        )}

        {/* 🔹 Wrapper styling from Input 1 (The border and focus logic) */}
        <div
          className={cn(
            "flex items-center rounded-lg overflow-hidden transition-all",
            showError
              ? "border border-red-500 bg-red-50"
              : "border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-emerald-500",
            props.disabled && "opacity-60 cursor-not-allowed",
          )}
        >
          {/* 🔹 Prefix Styling */}
          {prefix && (
            <span className="flex items-center pl-3 pr-1 text-gray-400">
              {prefix}
            </span>
          )}

          {/* 🔹 The Input itself */}
          <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              "w-full px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-gray-400 disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />

          {/* 🔹 Suffix Styling */}
          {suffix && (
            <span
              className="flex items-center pl-1 pr-3 text-gray-500 cursor-pointer select-none"
              onClick={onSuffixClick}
            >
              {suffix}
            </span>
          )}
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

Input.displayName = "Input";

export { Input };
