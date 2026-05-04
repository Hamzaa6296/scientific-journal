/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/hooks/useAuth";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import notificationsService from "@/services/notificationsService";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("notifications");
  type Tab = "notifications" | ("account" | "notifications");

  // ── Notification preferences ───────────────────────────────────────────────
  const [notifPrefs, setNotifPrefs] = useState({
    emailOnDecision: true,
    emailOnReview: true,
    emailOnAssignment: true,
    emailOnPublished: true,
  });
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState("");

  // ── Clear notifications ────────────────────────────────────────────────────
  const [clearingNotifs, setClearingNotifs] = useState(false);
  const [clearSuccess, setClearSuccess] = useState("");
  const [clearError, setClearError] = useState("");

  // ── Appearance ─────────────────────────────────────────────────────────────
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );

  const handleSaveNotifPrefs = async () => {
    setSavingNotif(true);
    setNotifSuccess("");
    // In a real app you'd persist these to the backend.
    // For now we simulate a save with a small delay.
    await new Promise((r) => setTimeout(r, 600));
    setSavingNotif(false);
    setNotifSuccess("Notification preferences saved.");
    setTimeout(() => setNotifSuccess(""), 3000);
  };

  const handleClearAllNotifications = async () => {
    if (!confirm("Delete all your notifications? This cannot be undone."))
      return;
    setClearingNotifs(true);
    setClearError("");
    setClearSuccess("");
    try {
      await notificationsService.deleteAll();
      setClearSuccess("All notifications cleared.");
      setTimeout(() => setClearSuccess(""), 3000);
    } catch (err) {
      setClearError(getErrorMessage(err));
    } finally {
      setClearingNotifs(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm("This will sign you out of this session. Continue?")) return;
    await dispatch(logoutUser());
    router.push("/login");
  };

  const TABS = [
    { key: "notifications", label: "🔔 Notifications" },
    { key: "account", label: "⚙️ Account" },
  ] as const;

  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary-900)",
            fontSize: "28px",
            margin: "0 0 4px",
          }}
        >
          Settings
        </h2>
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Manage your preferences and account settings
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-surface-200)",
          marginBottom: "28px",
        }}
      >
        {TABS.map((tab) => (
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
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── NOTIFICATIONS TAB ─────────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Email preferences */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Email Notifications</h3>
            <p style={cardDescStyle}>
              Choose which events trigger an email to your inbox.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                {
                  key: "emailOnDecision",
                  label: "Editorial decisions",
                  desc: "When an editor accepts, rejects, or requests revision on your paper.",
                },
                {
                  key: "emailOnReview",
                  label: "Review updates",
                  desc: "When reviewers submit their reviews (editors only).",
                },
                {
                  key: "emailOnAssignment",
                  label: "Review assignments",
                  desc: "When you are assigned to review a paper.",
                },
                {
                  key: "emailOnPublished",
                  label: "Publication notice",
                  desc: "When your paper is published.",
                },
              ].map((item, index, arr) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    padding: "16px 0",
                    borderBottom:
                      index < arr.length - 1
                        ? "1px solid var(--color-surface-100)"
                        : "none",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        fontFamily: "var(--font-sans)",
                        color: "var(--color-surface-800)",
                        margin: "0 0 2px",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontFamily: "var(--font-sans)",
                        color: "var(--color-surface-400)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div
                    onClick={() =>
                      setNotifPrefs((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key as keyof typeof prev],
                      }))
                    }
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "999px",
                      backgroundColor: notifPrefs[
                        item.key as keyof typeof notifPrefs
                      ]
                        ? "var(--color-primary-900)"
                        : "var(--color-surface-300)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        position: "absolute",
                        top: "3px",
                        left: notifPrefs[item.key as keyof typeof notifPrefs]
                          ? "23px"
                          : "3px",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {notifSuccess && (
              <div style={{ ...successBoxStyle, marginTop: "16px" }}>
                ✓ {notifSuccess}
              </div>
            )}

            <div
              style={{
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid var(--color-surface-200)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleSaveNotifPrefs}
                disabled={savingNotif}
                className="btn-primary"
                style={{ minWidth: "120px" }}
              >
                {savingNotif ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>

          {/* Clear notifications */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Manage Notifications</h3>
            <p style={cardDescStyle}>
              Clear your notification history from the bell icon.
            </p>

            {clearSuccess && (
              <div style={{ ...successBoxStyle, marginBottom: "16px" }}>
                ✓ {clearSuccess}
              </div>
            )}
            {clearError && (
              <div style={{ ...errorBoxStyle, marginBottom: "16px" }}>
                {clearError}
              </div>
            )}

            <button
              onClick={handleClearAllNotifications}
              disabled={clearingNotifs}
              className="btn-secondary"
              style={{ fontSize: "13px", padding: "8px 18px" }}
            >
              {clearingNotifs ? "Clearing..." : "🗑 Clear All Notifications"}
            </button>
          </div>
        </div>
      )}

      {/* ── ACCOUNT TAB ───────────────────────────────────────────────────── */}
      {activeTab === "account" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Account summary */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Account Details</h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                { label: "Name", value: user?.name || "—" },
                { label: "Email", value: user?.email || "—" },
                { label: "Role", value: user?.role || "—", capitalize: true },
              ].map((row) => (
                <div
                  key={row.label}
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
                      color: "var(--color-surface-500)",
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-surface-800)",
                      textTransform: row.capitalize ? "capitalize" : "none",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "16px" }}>
              <Link
                href="/profile"
                className="btn-secondary"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  fontSize: "13px",
                  padding: "8px 18px",
                }}
              >
                Edit Profile →
              </Link>
            </div>
          </div>

          {/* Sessions */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Active Session</h3>
            <p style={cardDescStyle}>
              You are currently signed in. Signing out will clear your session
              on this device.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                backgroundColor: "var(--color-surface-50)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-surface-200)",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "24px" }}>💻</span>
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-surface-800)",
                    margin: "0 0 2px",
                  }}
                >
                  Current Device
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-surface-400)",
                    margin: 0,
                  }}
                >
                  Web browser · Active now
                </p>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "11px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  color: "#15803d",
                  backgroundColor: "#f0fdf4",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  border: "1px solid #bbf7d0",
                }}
              >
                Active
              </span>
            </div>

            <button
              onClick={handleLogoutAllDevices}
              className="btn-secondary"
              style={{ fontSize: "13px", padding: "8px 18px" }}
            >
              🚪 Sign Out
            </button>
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
                lineHeight: 1.6,
              }}
            >
              Permanently delete your account and all associated data. This
              action is irreversible.
            </p>
            <button
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

// ─── Shared styles ─────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-surface-200)",
  boxShadow: "var(--shadow-card)",
  padding: "24px",
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  color: "var(--color-primary-900)",
  fontSize: "16px",
  margin: "0 0 4px",
};

const cardDescStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--color-surface-500)",
  fontFamily: "var(--font-sans)",
  margin: "0 0 20px",
  lineHeight: 1.6,
};

const successBoxStyle: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: "13px",
  color: "#15803d",
  fontFamily: "var(--font-sans)",
};

const errorBoxStyle: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: "13px",
  color: "#b91c1c",
  fontFamily: "var(--font-sans)",
};
