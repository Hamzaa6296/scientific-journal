interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export default function Spinner({ size = "md" }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-[3px]",
  };

  return (
    <div
      style={{
        borderColor: "var(--color-surface-300)",
        borderTopColor: "var(--color-primary-900)",
      }}
      className={`${sizes[size]} rounded-full animate-spin`}
    />
  );
}
