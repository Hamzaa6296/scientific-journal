"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/hooks/useAuth";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Navigation items per role
const navItems: Record<
  string,
  { label: string; href: string; icon: string }[]
> = {
  author: [
    { label: "My Submissions", href: "/author/submissions", icon: "📄" },
    { label: "Submit Paper", href: "/author/submit", icon: "✏️" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ],
  editor: [
    { label: "All Submissions", href: "/editor/submissions", icon: "📋" },
    { label: "Reviewer Pool", href: "/editor/reviewers", icon: "👥" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ],
  reviewer: [
    { label: "My Assignments", href: "/reviewer/assignments", icon: "🔍" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ],
  admin: [
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "All Papers", href: "/admin/papers", icon: "📄" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const items = navItems[user?.role || "author"] || [];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 40,
            display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "var(--color-primary-900)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          transition: "transform 0.3s ease",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",

          boxShadow: "var(--shadow-sidebar)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
          <h1
            style={{
              color: "var(--color-accent-500)",
              fontSize: "18px",
              fontFamily: "var(--font-serif)",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            Scientific Journal
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "11px",
              fontFamily: "var(--font-sans)",
              marginTop: "2px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {user?.role || "Portal"}
          </p>
        </div>

        {/* User info */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "var(--color-accent-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--color-primary-900)",
              fontFamily: "var(--font-sans)",
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              "?"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "User"}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontFamily: "var(--font-sans)",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "10px",
              fontFamily: "var(--font-sans)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              padding: "8px 8px 4px",
              margin: 0,
            }}
          >
            Navigation
          </p>

          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "2px",
                textDecoration: "none",
                transition: "all 0.15s",
                backgroundColor: isActive(item.href)
                  ? "rgba(201,168,76,0.15)"
                  : "transparent",
                borderLeft: isActive(item.href)
                  ? "3px solid var(--color-accent-500)"
                  : "3px solid transparent",
              }}
            >
              <span
                style={{ fontSize: "16px", width: "20px", textAlign: "center" }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: isActive(item.href) ? 600 : 400,
                  color: isActive(item.href)
                    ? "var(--color-accent-500)"
                    : "rgba(255,255,255,0.75)",
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              transition: "background-color 0.15s",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
          >
            <span style={{ fontSize: "16px" }}>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
