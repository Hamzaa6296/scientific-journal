"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAuth } from "@/hooks/useAuth";
import { registerUser, clearError } from "@/store/slices/authSlice";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, successMessage } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    affiliation: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [form]);

  // On success redirect to OTP verification
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
      }, 1500);
    }
  }, [successMessage]);

  const validate = (): boolean => {
    const errors = { name: "", email: "", password: "", confirmPassword: "" };
    let valid = true;

    if (!form.name.trim()) {
      errors.name = "Full name is required";
      valid = false;
    } else if (form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      valid = false;
    }

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
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await dispatch(
      registerUser({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        affiliation: form.affiliation.trim(),
      }),
    );
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: "#ef4444", width: "25%" };
    if (p.length < 8) return { label: "Fair", color: "#f97316", width: "50%" };
    if (p.length < 12 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
      return { label: "Good", color: "#f59e0b", width: "75%" };
    return { label: "Strong", color: "#22c55e", width: "100%" };
  };

  const strength = getPasswordStrength();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "460px",
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
          Create Account
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            marginTop: "4px",
          }}
        >
          Join the research community
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
        {/* Success message */}
        {successMessage && (
          <div style={successBoxStyle}>
            <span>✓</span> {successMessage} Redirecting to verification...
          </div>
        )}

        {/* API Error */}
        {error && !successMessage && <div style={errorBoxStyle}>{error}</div>}

        {/* Name */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Full Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Dr. John Smith"
            className={`input-base ${formErrors.name ? "input-error" : ""}`}
          />
          {formErrors.name && <p style={errorStyle}>{formErrors.name}</p>}
        </div>

        {/* Email */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Email Address *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@university.edu"
            className={`input-base ${formErrors.email ? "input-error" : ""}`}
          />
          {formErrors.email && <p style={errorStyle}>{formErrors.email}</p>}
        </div>

        {/* Affiliation */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>
            Institution / Affiliation
            <span
              style={{
                color: "var(--color-surface-400)",
                fontWeight: 400,
                marginLeft: "4px",
              }}
            >
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={form.affiliation}
            onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
            placeholder="University of Science and Technology"
            className="input-base"
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Password *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 8 characters"
              className={`input-base ${formErrors.password ? "input-error" : ""}`}
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
          {/* Password strength bar */}
          {strength && (
            <div style={{ marginTop: "8px" }}>
              <div
                style={{
                  height: "4px",
                  backgroundColor: "var(--color-surface-200)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: strength.width,
                    backgroundColor: strength.color,
                    borderRadius: "2px",
                    transition: "width 0.3s, background-color 0.3s",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "11px",
                  color: strength.color,
                  marginTop: "4px",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {strength.label} password
              </p>
            </div>
          )}
          {formErrors.password && (
            <p style={errorStyle}>{formErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: "28px" }}>
          <label style={labelStyle}>Confirm Password *</label>
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
            <p style={errorStyle}>{formErrors.confirmPassword}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || !!successMessage}
          style={{ width: "100%" }}
        >
          {isLoading ? (
            <>
              <Loader /> Creating Account...
            </>
          ) : (
            "Create Account"
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
          Already have an account?{" "}
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
