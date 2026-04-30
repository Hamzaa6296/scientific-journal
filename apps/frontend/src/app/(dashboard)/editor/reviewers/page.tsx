export default function ReviewerPoolPage() {
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
        Reviewer Pool
      </h2>
      <div className="card">
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Available reviewers will appear here.
        </p>
      </div>
    </div>
  );
}
