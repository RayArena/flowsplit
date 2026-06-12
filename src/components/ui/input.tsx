import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#cbd5e1]"
          >
            {label}
            {props.required && <span className="text-[#f87171] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-xl bg-[#1e293b] border border-white/10",
              "px-3 py-2 text-sm text-[#f8fafc] placeholder-[#475569]",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50",
              "hover:border-white/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-[#ef4444]/50 focus:ring-[#ef4444]/30",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[#f87171] flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#64748b]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#cbd5e1]">
            {label}
            {props.required && <span className="text-[#f87171] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl bg-[#1e293b] border border-white/10",
            "px-3 py-2 text-sm text-[#f8fafc] placeholder-[#475569]",
            "transition-all duration-150 resize-none min-h-[80px]",
            "focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50",
            "hover:border-white/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[#ef4444]/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#f87171]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#64748b]">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
