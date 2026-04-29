import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {label && (
          <label
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--color-surface-700)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-base ${error ? "input-error" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p
            style={{
              fontSize: "12px",
              color: "#ef4444",
              fontFamily: "var(--font-sans)",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
