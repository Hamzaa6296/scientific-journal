export default function AuthorSubmissionsPage() {
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-primary-900)",
          marginBottom: "24px",
          fontSize: "28px",
        }}
      >
        My Submissions
      </h2>
      <div className="card">
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Your submitted papers will appear here.
        </p>
      </div>
    </div>
  );
}
