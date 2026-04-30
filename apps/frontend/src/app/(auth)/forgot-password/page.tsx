"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError("");

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      console.log(err.response);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={cardStyle}>
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
            Check Your Email
          </h2>
        </div>

        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>📬</div>
          <h3
            style={{
              fontSize: "18px",
              color: "var(--color-primary-900)",
              fontFamily: "var(--font-serif)",
              marginBottom: "12px",
            }}
          >
            Reset Code Sent
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-600)",
              fontFamily: "var(--font-sans)",
              lineHeight: 1.7,
              marginBottom: "28px",
            }}
          >
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a
            6-digit reset code to that address.
          </p>

          <button
            className="btn-primary"
            style={{ width: "100%", marginBottom: "12px" }}
            onClick={() =>
              router.push(`/reset-password?email=${encodeURIComponent(email)}`)
            }
          >
            Enter Reset Code
          </button>

          <button
            className="btn-secondary"
            style={{ width: "100%" }}
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
          >
            Try Different Email
          </button>
        </div>
      </div>
    );
  }

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
          Reset Password
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            marginTop: "4px",
          }}
        >
          We&apos;ll send a reset code to your email
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
        {error && <div style={errorBoxStyle}>{error}</div>}

        <p
          style={{
            fontSize: "14px",
            color: "var(--color-surface-600)",
            fontFamily: "var(--font-sans)",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
          Enter the email address associated with your account and we&apos;ll
          send you a 6-digit code to reset your password.
        </p>

        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
              setError("");
            }}
            placeholder="you@example.com"
            autoFocus
            className={`input-base ${emailError ? "input-error" : ""}`}
          />
          {emailError && <p style={errorMsgStyle}>{emailError}</p>}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          style={{ width: "100%" }}
        >
          {isLoading ? (
            <>
              <Loader /> Sending Code...
            </>
          ) : (
            "Send Reset Code"
          )}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
            fontFamily: "var(--font-sans)",
            color: "var(--color-surface-600)",
          }}
        >
          Remember your password?{" "}
          <a
            href="/login"
            style={{
              color: "var(--color-primary-900)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </p>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
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
