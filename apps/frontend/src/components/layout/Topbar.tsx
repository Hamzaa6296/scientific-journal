"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import notificationsService from "@/services/notificationsService";

interface TopbarProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  paperId?: string;
}

export default function Topbar({ onMenuClick, pageTitle }: TopbarProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch {
      // silently fail
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationsService.getMyNotifications(1, 8);
      setNotifications(data.notifications);
    } catch {
      // silently fail
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
    if (!showNotifications) fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const getNotifIcon = (type: string) => {
    const icons: Record<string, string> = {
      paper_submitted: "📨",
      paper_under_review: "🔍",
      paper_revision: "✏️",
      paper_accepted: "✅",
      paper_rejected: "❌",
      paper_published: "🎉",
      review_assigned: "📋",
      review_submitted: "📝",
      all_reviews_complete: "🏁",
    };
    return icons[type] || "🔔";
  };

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "white",
        borderBottom: "1px solid var(--color-surface-200)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Left: hamburger + page title */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onMenuClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-surface-600)",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
          }}
        >
          ☰
        </button>
        {pageTitle && (
          <h2
            style={{
              fontSize: "18px",
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              margin: 0,
            }}
          >
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Right: notifications + user menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={handleBellClick}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "20px",
              color: "var(--color-surface-600)",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--color-surface-100)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  fontFamily: "var(--font-sans)",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  border: "2px solid white",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "360px",
                backgroundColor: "white",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-surface-200)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--color-surface-200)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-primary-900)",
                    margin: 0,
                  }}
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span
                      style={{
                        marginLeft: "8px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        borderRadius: "999px",
                        fontSize: "11px",
                        padding: "1px 7px",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "var(--color-primary-900)",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "var(--color-surface-400)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                      🔔
                    </div>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() =>
                        !notif.isRead && handleMarkOneRead(notif.id)
                      }
                      style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid var(--color-surface-100)",
                        cursor: notif.isRead ? "default" : "pointer",
                        backgroundColor: notif.isRead ? "white" : "#fafbff",
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!notif.isRead)
                          e.currentTarget.style.backgroundColor = "#f0f4ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = notif.isRead
                          ? "white"
                          : "#fafbff";
                      }}
                    >
                      <span
                        style={{
                          fontSize: "18px",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        {getNotifIcon(notif.type)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontFamily: "var(--font-sans)",
                            color: "var(--color-surface-800)",
                            margin: 0,
                            lineHeight: 1.5,
                            fontWeight: notif.isRead ? 400 : 600,
                          }}
                        >
                          {notif.message}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--color-surface-400)",
                            fontFamily: "var(--font-sans)",
                            margin: "3px 0 0",
                          }}
                        >
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-primary-900)",
                            flexShrink: 0,
                            marginTop: "4px",
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--color-surface-200)",
                  textAlign: "center",
                }}
              >
                <a
                  href="/notifications"
                  style={{
                    fontSize: "13px",
                    color: "var(--color-primary-900)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  View all notifications →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--color-surface-100)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary-900)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--color-accent-500)",
                fontFamily: "var(--font-sans)",
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-surface-800)",
                }}
              >
                {user?.name || "User"}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-surface-400)",
                  textTransform: "capitalize",
                }}
              >
                {user?.role}
              </p>
            </div>
            <span
              style={{
                fontSize: "10px",
                color: "var(--color-surface-400)",
                marginLeft: "4px",
              }}
            >
              ▼
            </span>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "200px",
                backgroundColor: "white",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-surface-200)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 100,
                overflow: "hidden",
                padding: "4px",
              }}
            >
              {[
                { label: "My Profile", href: "/profile", icon: "👤" },
                { label: "Settings", href: "/settings", icon: "⚙️" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-surface-700)",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--color-surface-100)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
