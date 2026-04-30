"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/services/authService";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [step, setStep] = useState<"otp" | "password">("otp");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [formErrors, setFormErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const lastIndex = Math.min(index + digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.verifyResetOtp(emailFromUrl, otpString);
      setVerifiedOtp(otpString);
      setStep("password");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired code");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { newPassword: "", confirmPassword: "" };
    let valid = true;

    if (!form.newPassword) {
      errors.newPassword = "Password is required";
      valid = false;
    } else if (form.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
      valid = false;
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setFormErrors(errors);
    if (!valid) return;

    setIsLoading(true);
    setError("");

    try {
      await authService.resetPassword(
        emailFromUrl,
        verifiedOtp,
        form.newPassword,
      );
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
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
          {step === "otp" ? "Enter Reset Code" : "Set New Password"}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            marginTop: "4px",
          }}
        >
          {step === "otp"
            ? "Check your email for the 6-digit code"
            : "Choose a strong new password"}
        </p>
      </div>

      {/* Step indicator */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-surface-200)",
        }}
      >
        {["Enter Code", "New Password"].map((label, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: "12px",
              textAlign: "center",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              borderBottom: `2px solid ${(i === 0 && step === "otp") || (i === 1 && step === "password") ? "var(--color-primary-900)" : "transparent"}`,
              color:
                (i === 0 && step === "otp") || (i === 1 && step === "password")
                  ? "var(--color-primary-900)"
                  : "var(--color-surface-400)",
              transition: "all 0.2s",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor:
                  (i === 0 && step === "otp") ||
                  (i === 1 && step === "password") ||
                  (i === 0 && step === "password")
                    ? "var(--color-primary-900)"
                    : "var(--color-surface-200)",
                color:
                  (i === 0 && step === "otp") ||
                  (i === 1 && step === "password") ||
                  (i === 0 && step === "password")
                    ? "white"
                    : "var(--color-surface-500)",
                fontSize: "11px",
                marginRight: "6px",
              }}
            >
              {i === 0 && step === "password" ? "✓" : i + 1}
            </span>
            {label}
          </div>
        ))}
      </div>

      <div style={{ padding: "32px" }}>
        {success && (
          <div style={successBoxStyle}>
            <span>✓</span> {success}
          </div>
        )}
        {error && <div style={errorBoxStyle}>{error}</div>}

        {/* Step 1: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-surface-600)",
                fontFamily: "var(--font-sans)",
                marginBottom: "24px",
              }}
            >
              Enter the 6-digit code sent to <strong>{emailFromUrl}</strong>
            </p>

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
                    backgroundColor: digit
                      ? "var(--color-primary-50)"
                      : "white",
                    transition: "border-color 0.2s",
                  }}
                />
              ))}
            </div>

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
                "Verify Code"
              )}
            </button>

            <p
              style={{
                textAlign: "center",
                marginTop: "16px",
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-surface-500)",
              }}
            >
              <a
                href="/forgot-password"
                style={{
                  color: "var(--color-primary-900)",
                  textDecoration: "none",
                }}
              >
                ← Request a new code
              </a>
            </p>
          </form>
        )}

        {/* Step 2: New Password */}
        {step === "password" && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  placeholder="Minimum 8 characters"
                  autoFocus
                  className={`input-base ${formErrors.newPassword ? "input-error" : ""}`}
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButtonStyle}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {formErrors.newPassword && (
                <p style={errorMsgStyle}>{formErrors.newPassword}</p>
              )}
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="Repeat your password"
                className={`input-base ${formErrors.confirmPassword ? "input-error" : ""}`}
              />
              {formErrors.confirmPassword && (
                <p style={errorMsgStyle}>{formErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !!success}
              style={{ width: "100%" }}
            >
              {isLoading ? (
                <>
                  <Loader /> Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
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

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "white",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-surface-200)",
  boxShadow: "var(--shadow-card)",
  overflow: "hidden",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-surface-700)",
  fontFamily: "var(--font-sans)",
  marginBottom: "6px",
};

const errorMsgStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#ef4444",
  fontFamily: "var(--font-sans)",
  marginTop: "4px",
};

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

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--color-surface-500)",
  fontSize: "18px",
  padding: "4px",
};
