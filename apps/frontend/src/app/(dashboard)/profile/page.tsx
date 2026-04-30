export default function ProfilePage() {
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
        My Profile
      </h2>
      <div className="card">
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Profile settings coming soon.
        </p>
      </div>
    </div>
  );
}
