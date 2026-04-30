"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAuth } from "@/hooks/useAuth";
import { loginUser, clearError } from "@/store/slices/authSlice";
import { getRoleDashboardPath } from "@/lib/utils";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading, error, user } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(getRoleDashboardPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  // Clear API error when user starts typing
  useEffect(() => {
    if (error) dispatch(clearError());
  }, [form]);

  const validate = (): boolean => {
    const errors = { email: "", password: "" };
    let valid = true;

    if (!form.email) {
      errors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address";
      valid = false;
    }

    if (!form.password) {
      errors.password = "Password is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(loginUser(form));

    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      router.push(getRoleDashboardPath(role));
    }
  };

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
      {/* Card header */}
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
          Sign In
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            marginTop: "4px",
          }}
        >
          Access your journal account
        </p>
      </div>

      {/* Card body */}
      <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
        {/* API Error */}
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "14px",
              color: "#b91c1c",
              fontFamily: "var(--font-sans)",
            }}
          >
            {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
            className={`input-base ${formErrors.email ? "input-error" : ""}`}
          />
          {formErrors.email && <p style={errorStyle}>{formErrors.email}</p>}
        </div>

        {/* Password */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <label style={labelStyle}>Password</label>
            <a
              href="/forgot-password"
              style={{
                fontSize: "13px",
                color: "var(--color-primary-900)",
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              Forgot password?
            </a>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`input-base ${formErrors.password ? "input-error" : ""}`}
              style={{ paddingRight: "48px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
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
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {formErrors.password && (
            <p style={errorStyle}>{formErrors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          style={{ width: "100%" }}
        >
          {isLoading ? (
            <>
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Register link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
            fontFamily: "var(--font-sans)",
            color: "var(--color-surface-600)",
          }}
        >
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            style={{
              color: "var(--color-primary-900)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Register here
          </a>
        </p>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-surface-700)",
  fontFamily: "var(--font-sans)",
  marginBottom: "6px",
};

const errorStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#ef4444",
  fontFamily: "var(--font-sans)",
  marginTop: "4px",
};
