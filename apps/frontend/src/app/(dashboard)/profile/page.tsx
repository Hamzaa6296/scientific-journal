"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/hooks/useAuth";
import { updateUser } from "@/store/slices/authSlice";
import usersService from "@/services/usersService";
import authService from "@/services/authService";
import { getErrorMessage } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

const ROLE_LABELS: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  admin: {
    label: "Administrator",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  editor: {
    label: "Editor",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  reviewer: {
    label: "Reviewer",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  author: {
    label: "Author",
    color: "#525252",
    bg: "#f5f5f0",
    border: "#e5e5e5",
  },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: "",
    affiliation: "",
    bio: "",
    expertise: [] as string[],
  });
  const [expertiseInput, setExpertiseInput] = useState("");
  const [profileErrors, setProfileErrors] = useState({ name: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // ── Password state ─────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // ── Load profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const data = await usersService.getProfile();
      setProfileForm({
        name: data.name || "",
        affiliation: data.affiliation || "",
        bio: data.bio || "",
        expertise: data.expertise || [],
      });
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ── Expertise tag helpers ──────────────────────────────────────────────────
  const addExpertise = () => {
    const val = expertiseInput.trim();
    if (
      val &&
      !profileForm.expertise.includes(val) &&
      profileForm.expertise.length < 15
    ) {
      setProfileForm({
        ...profileForm,
        expertise: [...profileForm.expertise, val],
      });
      setExpertiseInput("");
    }
  };

  const removeExpertise = (item: string) => {
    setProfileForm({
      ...profileForm,
      expertise: profileForm.expertise.filter((e) => e !== item),
    });
  };

  const handleExpertiseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addExpertise();
    }
  };

  // ── Profile submit ─────────────────────────────────────────────────────────
  const validateProfile = (): boolean => {
    const errors = { name: "" };
    let valid = true;
    if (!profileForm.name.trim()) {
      errors.name = "Name is required";
      valid = false;
    } else if (profileForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      valid = false;
    }
    setProfileErrors(errors);
    return valid;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setIsSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const updated = await usersService.updateProfile({
        name: profileForm.name.trim(),
        affiliation: profileForm.affiliation.trim(),
        bio: profileForm.bio.trim(),
        expertise: profileForm.expertise,
      });

      // Sync the updated name into Redux store so the sidebar reflects it immediately
      dispatch(
        updateUser({ name: updated.name, affiliation: updated.affiliation }),
      );
      setProfileSuccess("Profile updated successfully.");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Password submit ────────────────────────────────────────────────────────
  const validatePassword = (): boolean => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let valid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
      valid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
      valid = false;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
      valid = false;
    } else if (passwordForm.newPassword === passwordForm.currentPassword) {
      errors.newPassword =
        "New password must be different from current password";
      valid = false;
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      valid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setPasswordErrors(errors);
    return valid;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      // We use the reset password flow: send OTP to email first
      // For a cleaner experience we use forgot + reset with current session
      // In a production app you'd have a dedicated changePassword endpoint
      // For now we call forgotPassword to send OTP then user goes through reset flow
      await authService.forgotPassword(user?.email || "");
      setPasswordSuccess(
        "A password reset code has been sent to your email. Use it to set your new password.",
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const roleConfig =
    ROLE_LABELS[user?.role || "author"] || ROLE_LABELS["author"];

  if (isLoadingProfile) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px" }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary-900)",
            fontSize: "28px",
            margin: "0 0 4px",
          }}
        >
          My Profile
        </h2>
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile summary card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-surface-200)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-primary-900)",
            padding: "28px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "var(--color-accent-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--color-primary-900)",
              fontFamily: "var(--font-sans)",
              flexShrink: 0,
              border: "3px solid rgba(255,255,255,0.2)",
            }}
          >
            {profileForm.name?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              "?"}
          </div>

          {/* Info */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "white",
                fontSize: "20px",
                margin: "0 0 4px",
              }}
            >
              {profileForm.name || "Your Name"}
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-sans)",
                margin: "0 0 10px",
              }}
            >
              {user?.email}
            </p>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: "999px",
                backgroundColor: roleConfig.bg,
                color: roleConfig.color,
                border: `1px solid ${roleConfig.border}`,
              }}
            >
              {roleConfig.label}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            borderTop: "1px solid var(--color-surface-200)",
          }}
        >
          {[
            { label: "Role", value: roleConfig.label },
            {
              label: "Institution",
              value: profileForm.affiliation || "Not set",
            },
            {
              label: "Expertise",
              value:
                profileForm.expertise.length > 0
                  ? `${profileForm.expertise.length} field${profileForm.expertise.length !== 1 ? "s" : ""}`
                  : "Not set",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                padding: "16px 20px",
                borderRight:
                  i < 2 ? "1px solid var(--color-surface-200)" : "none",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  color: "var(--color-surface-400)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: "0 0 4px",
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-surface-700)",
                  fontWeight: 500,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-surface-200)",
          marginBottom: "24px",
        }}
      >
        {(
          [
            { key: "profile", label: "👤 Edit Profile" },
            { key: "security", label: "🔒 Security" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontFamily: "var(--font-sans)",
              fontWeight: activeTab === tab.key ? 600 : 400,
              color:
                activeTab === tab.key
                  ? "var(--color-primary-900)"
                  : "var(--color-surface-500)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--color-primary-900)"
                  : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ───────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-surface-200)",
            boxShadow: "var(--shadow-card)",
            padding: "28px",
          }}
        >
          {profileSuccess && (
            <div style={successBoxStyle}>✓ {profileSuccess}</div>
          )}

          {profileError && <div style={errorBoxStyle}>{profileError}</div>}

          <form onSubmit={handleSaveProfile}>
            {/* Name */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, name: e.target.value });
                  setProfileErrors({ name: "" });
                }}
                placeholder="Dr. John Smith"
                className={`input-base ${profileErrors.name ? "input-error" : ""}`}
              />
              {profileErrors.name && (
                <p style={errorMsgStyle}>{profileErrors.name}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Email Address
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "6px",
                  }}
                >
                  (cannot be changed)
                </span>
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="input-base"
                style={{
                  backgroundColor: "var(--color-surface-100)",
                  color: "var(--color-surface-400)",
                  cursor: "not-allowed",
                }}
              />
            </div>

            {/* Affiliation */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Institution / Affiliation
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "6px",
                  }}
                >
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={profileForm.affiliation}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    affiliation: e.target.value,
                  })
                }
                placeholder="University of Science and Technology"
                className="input-base"
              />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Bio
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "6px",
                  }}
                >
                  ({profileForm.bio.length}/500)
                </span>
              </label>
              <textarea
                value={profileForm.bio}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, bio: e.target.value })
                }
                placeholder="Tell the community about your research interests and background..."
                rows={4}
                maxLength={500}
                className="input-base"
                style={{ resize: "vertical", lineHeight: 1.7 }}
              />
            </div>

            {/* Expertise */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>
                Research Expertise
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "6px",
                  }}
                >
                  ({profileForm.expertise.length}/15 — press Enter or comma to
                  add)
                </span>
              </label>

              <div
                style={{ display: "flex", gap: "8px", marginBottom: "10px" }}
              >
                <input
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={handleExpertiseKeyDown}
                  placeholder="e.g. Machine Learning"
                  className="input-base"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addExpertise}
                  className="btn-secondary"
                  style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
                >
                  Add
                </button>
              </div>

              {profileForm.expertise.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {profileForm.expertise.map((item) => (
                    <span
                      key={item}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "var(--color-primary-50)",
                        color: "var(--color-primary-900)",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontFamily: "var(--font-sans)",
                        border: "1px solid var(--color-primary-200)",
                      }}
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeExpertise(item)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "15px",
                          color: "var(--color-primary-900)",
                          padding: 0,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {profileForm.expertise.length === 0 && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-surface-400)",
                    fontFamily: "var(--font-sans)",
                    margin: 0,
                  }}
                >
                  No expertise added yet. Add your research fields above.
                </p>
              )}
            </div>

            {/* Submit */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: "20px",
                borderTop: "1px solid var(--color-surface-200)",
              }}
            >
              <button
                type="submit"
                disabled={isSavingProfile}
                className="btn-primary"
                style={{ minWidth: "140px" }}
              >
                {isSavingProfile ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <SpinnerInline />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SECURITY TAB ──────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Account info */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-200)",
              boxShadow: "var(--shadow-card)",
              padding: "24px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                fontSize: "16px",
                margin: "0 0 16px",
              }}
            >
              Account Information
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {[
                { label: "Email", value: user?.email || "—" },
                { label: "Role", value: roleConfig.label },
                { label: "Email Status", value: "✓ Verified" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    backgroundColor: "var(--color-surface-50)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-surface-200)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      color: "var(--color-surface-600)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-sans)",
                      color:
                        item.label === "Email Status"
                          ? "#15803d"
                          : "var(--color-surface-800)",
                      fontWeight: item.label === "Email Status" ? 600 : 400,
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-200)",
              boxShadow: "var(--shadow-card)",
              padding: "24px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                fontSize: "16px",
                margin: "0 0 6px",
              }}
            >
              Change Password
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-surface-500)",
                fontFamily: "var(--font-sans)",
                margin: "0 0 20px",
              }}
            >
              For security, we will send a reset code to your email address.
            </p>

            {passwordSuccess && (
              <div style={successBoxStyle}>✓ {passwordSuccess}</div>
            )}

            {passwordError && <div style={errorBoxStyle}>{passwordError}</div>}

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Current Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      });
                      setPasswordErrors({
                        ...passwordErrors,
                        currentPassword: "",
                      });
                    }}
                    placeholder="Enter your current password"
                    className={`input-base ${passwordErrors.currentPassword ? "input-error" : ""}`}
                    style={{ paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    style={eyeButtonStyle}
                  >
                    {showPasswords ? "🙈" : "👁️"}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p style={errorMsgStyle}>{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>New Password *</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    });
                    setPasswordErrors({ ...passwordErrors, newPassword: "" });
                  }}
                  placeholder="Minimum 8 characters"
                  className={`input-base ${passwordErrors.newPassword ? "input-error" : ""}`}
                />
                {passwordErrors.newPassword && (
                  <p style={errorMsgStyle}>{passwordErrors.newPassword}</p>
                )}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Confirm New Password *</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    });
                    setPasswordErrors({
                      ...passwordErrors,
                      confirmPassword: "",
                    });
                  }}
                  placeholder="Repeat your new password"
                  className={`input-base ${passwordErrors.confirmPassword ? "input-error" : ""}`}
                />
                {passwordErrors.confirmPassword && (
                  <p style={errorMsgStyle}>{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--color-surface-200)",
                }}
              >
                <Link
                  href="/forgot-password"
                  style={{
                    fontSize: "13px",
                    color: "var(--color-primary-900)",
                    fontFamily: "var(--font-sans)",
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </Link>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="btn-primary"
                  style={{ minWidth: "160px" }}
                >
                  {isSavingPassword ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <SpinnerInline />
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Code"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Danger zone */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid #fecaca",
              boxShadow: "var(--shadow-card)",
              padding: "24px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "#b91c1c",
                fontSize: "16px",
                margin: "0 0 6px",
              }}
            >
              Danger Zone
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-surface-500)",
                fontFamily: "var(--font-sans)",
                margin: "0 0 16px",
              }}
            >
              Once you delete your account, all your data will be permanently
              removed. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() =>
                alert(
                  "To delete your account, please contact the administrator.",
                )
              }
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                padding: "8px 18px",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "transparent",
                color: "#ef4444",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline spinner ────────────────────────────────────────────────────────

function SpinnerInline() {
  return (
    <>
      <span
        style={{
          width: "14px",
          height: "14px",
          border: "2px solid rgba(201,168,76,0.3)",
          borderTopColor: "var(--color-accent-500)",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────

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

const successBoxStyle: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "var(--radius-sm)",
  padding: "12px 16px",
  marginBottom: "20px",
  fontSize: "14px",
  color: "#15803d",
  fontFamily: "var(--font-sans)",
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
