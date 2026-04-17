import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const RadioGroup = ({
  className,
  label,
  error,
  touched,
  helpText,
  orientation = "vertical",
  ...props
}) => {
  const showError = touched && error;

  return (
    <div className={cn("w-full", className)}>
      {/* Label styling matching Input component */}
      {label && (
        <label className="text-xs font-medium text-gray-600">{label}</label>
      )}

      {/* Radio Group with orientation support */}
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={cn(
          "flex gap-4",
          orientation === "vertical" ? "flex-col" : "flex-row",
          showError && "border-red-500 bg-red-50 rounded-lg p-3",
        )}
        {...props}
      />

      {/* Error Message matching Input component */}
      {showError && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          ⚠ {error}
        </p>
      )}

      {/* Help Text matching Input component */}
      {!showError && helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

const RadioGroupItem = ({ className, label, ...props }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        className={cn(
          // Base styling matching Input's border and background
          "relative flex aspect-square size-4 shrink-0 rounded-full",
          // Border and background matching Input component
          "border border-gray-300 bg-white",
          // Focus states matching Input's focus-within ring
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0",
          // Disabled state matching Input
          "disabled:cursor-not-allowed disabled:opacity-60",
          // Checked state styling
          "data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-50",
          // Error state (when parent has error)
          "aria-invalid:border-red-500 aria-invalid:bg-red-50",
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex items-center justify-center size-4"
        >
          {/* Inner circle matching Input's accent color */}
          <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 size-2 bg-emerald-500" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>

      {/* Label for individual radio option matching Input's label style */}
      {label && (
        <span className="text-sm text-gray-700 group-data-[disabled=true]:text-gray-400">
          {label}
        </span>
      )}
    </label>
  );
};

export { RadioGroup, RadioGroupItem };
