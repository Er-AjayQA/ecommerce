import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "./select";

export const CustomSelect = ({
  label,
  error,
  touched,
  helpText,
  placeholder,
  options = [],
  value,
  onValueChange,
  containerClass,
  disabled,
  isViewMode = false,
  ...props
}) => {
  const showError = touched && error;
  const isDisabled = disabled || isViewMode;

  // ✅ Get selected label for display
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className={cn("space-y-1.5 w-full", containerClass)}>
      {label && (
        <label
          className={cn(
            "text-xs font-medium",
            isDisabled ? "text-gray-400" : "text-gray-600",
          )}
        >
          {label}
        </label>
      )}

      {isDisabled ? (
        // ✅ View mode - show value without dropdown
        <div
          className={cn(
            "flex items-center rounded-lg border h-10 px-3 py-2.5 bg-gray-50 border-gray-200",
            showError && "border-red-500 bg-red-50",
            !selectedLabel && "text-gray-400",
          )}
        >
          <span className="text-sm">
            {selectedLabel || placeholder || "Select an option"}
          </span>
        </div>
      ) : (
        // ✅ Edit mode - normal dropdown
        <div
          className={cn(
            "flex items-center rounded-lg overflow-hidden transition-all border",
            showError
              ? "border-red-500 bg-red-50"
              : "border-gray-300 bg-white focus-within:ring-2 focus-within:ring-emerald-500",
          )}
        >
          <Select
            value={value}
            onValueChange={onValueChange}
            disabled={false}
            {...props}
          >
            <SelectTrigger
              className={cn(
                "border-none bg-transparent focus:ring-0 focus:ring-offset-0 h-10 w-full px-3 py-2.5 shadow-none flex items-center justify-between outline-none",
                !value && "text-gray-400",
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className="z-50 overflow-hidden bg-white border border-gray-200 rounded-md shadow-xl">
              <SelectGroup className="p-1">
                {options.map((opt) => (
                  <SelectPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1 pl-9 pr-3 text-sm outline-none transition-colors",
                      "hover:bg-emerald-700 hover:text-white focus:bg-emerald-600 focus:text-white",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    )}
                  >
                    <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="w-4 h-4" />
                      </SelectPrimitive.ItemIndicator>
                    </span>

                    <SelectPrimitive.ItemText>
                      {opt.label}
                    </SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {showError && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          ⚠ {error}
        </p>
      )}

      {!showError && helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
