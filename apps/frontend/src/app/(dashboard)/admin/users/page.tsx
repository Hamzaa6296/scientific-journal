export default function AdminUsersPage() {
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
        User Management
      </h2>
      <div className="card">
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
          }}
        >
          All users will appear here.
        </p>
      </div>
    </div>
  );
}
