"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/services/authService";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs for each OTP input box — so we can auto-focus next box
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Redirect if no email in URL
  useEffect(() => {
    if (!email) router.push("/register");
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      // Handle paste — distribute digits across inputs
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = Math.min(index + digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // On backspace with empty input, go to previous
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.verifyOtp(email, otpString);
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid verification code");
      // Clear the OTP inputs on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      await authService.resendOtp(email);
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setSuccess("A new code has been sent to your email.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "white",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-surface-200)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--color-primary-900)",
          padding: "24px 32px",
        }}
      >
        <h2
          style={{
            color: "var(--color-accent-500)",
            fontSize: "22px",
            fontFamily: "var(--font-serif)",
            margin: 0,
          }}
        >
          Verify Your Email
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            marginTop: "4px",
          }}
        >
          Enter the code sent to {maskedEmail}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "var(--color-surface-100)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontSize: "28px",
            }}
          >
            ✉️
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-600)",
              fontFamily: "var(--font-sans)",
              marginTop: "12px",
            }}
          >
            We sent a 6-digit verification code to your email address.
          </p>
        </div>

        {/* Success */}
        {success && (
          <div style={successBoxStyle}>
            <span>✓</span> {success}
          </div>
        )}

        {/* Error */}
        {error && <div style={errorBoxStyle}>{error}</div>}

        {/* OTP Input Boxes */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "28px",
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              style={{
                width: "52px",
                height: "60px",
                textAlign: "center",
                fontSize: "24px",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                color: "var(--color-primary-900)",
                border: `2px solid ${digit ? "var(--color-primary-900)" : "var(--color-surface-300)"}`,
                borderRadius: "var(--radius-sm)",
                outline: "none",
                transition: "border-color 0.2s",
                backgroundColor: digit ? "var(--color-primary-50)" : "white",
              }}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || otp.join("").length !== 6}
          style={{ width: "100%" }}
        >
          {isLoading ? (
            <>
              <Loader /> Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </button>

        {/* Resend */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-600)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Didn&apos;t receive the code?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary-900)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                }}
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            ) : (
              <span style={{ color: "var(--color-surface-400)" }}>
                Resend in {countdown}s
              </span>
            )}
          </p>
        </div>

        {/* Back to register */}
        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            color: "var(--color-surface-500)",
          }}
        >
          Wrong email?{" "}
          <a
            href="/register"
            style={{
              color: "var(--color-primary-900)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Go back
          </a>
        </p>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            color: "var(--color-surface-600)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Loading...
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}

function Loader() {
  return (
    <span
      style={{
        width: "16px",
        height: "16px",
        border: "2px solid rgba(201,168,76,0.3)",
        borderTopColor: "var(--color-accent-500)",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
        marginRight: "8px",
      }}
    />
  );
}

const errorBoxStyle: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "var(--radius-sm)",
  padding: "12px 16px",
  marginBottom: "20px",
  fontSize: "14px",
  color: "#b91c1c",
  fontFamily: "var(--font-sans)",
};

const successBoxStyle: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "var(--radius-sm)",
  padding: "12px 16px",
  marginBottom: "20px",
  fontSize: "14px",
  color: "#15803d",
  fontFamily: "var(--font-sans)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
