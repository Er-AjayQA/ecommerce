import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot"; // Standardized import
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Gradient and Shadow from Button 1
        default:
          "bg-gradient-to-r from-blue-500 to-indigo-600 " +
          "hover:from-blue-600 hover:to-indigo-700 " +
          "text-white shadow-md shadow-blue-500/30 transition-all duration-300",

        destructive: "bg-red-500 text-white hover:bg-red-600",

        outline:
          "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700",

        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",

        ghost: "hover:bg-gray-100 text-gray-700",

        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      children,
      text,
      textIcon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={props.type || "button"}
        disabled={loading || props.disabled}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            {/* 🔄 Spinner logic from Button 1 */}
            <span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />

            {/* 🔤 Dynamic Text logic */}
            {children === "Sign In" ? "Signing..." : "Loading..."}
          </span>
        ) : (
          children || (
            <span className="flex items-center justify-center gap-2">
              {textIcon}
              {text}
            </span>
          )
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
