export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-surface-100)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "48px",
            color: "var(--color-primary-900)",
            marginBottom: "12px",
          }}
        >
          Scientific Journal
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "var(--color-surface-600)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Peer-reviewed research platform
        </p>
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          <a href="/login" className="btn-primary">
            Sign In
          </a>
          <a href="/register" className="btn-secondary">
            Register
          </a>
        </div>
      </div>
    </main>
  );
}
