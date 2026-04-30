// PURPOSE: Shared layout for all auth pages.
// Centers content on screen with a clean background.
// All pages inside (auth)/ folder automatically use this layout.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-surface-100)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* Brand header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <h1
            style={{
              fontSize: "28px",
              color: "var(--color-primary-900)",
              fontFamily: "var(--font-serif)",
              letterSpacing: "1px",
              margin: 0,
            }}
          >
            Scientific Journal
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              marginTop: "4px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Peer-Reviewed Research Platform
          </p>
        </a>
      </div>

      {/* Page content */}
      {children}

      {/* Footer */}
      <p
        style={{
          marginTop: "32px",
          fontSize: "12px",
          color: "var(--color-surface-400)",
          fontFamily: "var(--font-sans)",
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} Scientific Journal. All rights reserved.
      </p>
    </div>
  );
}
