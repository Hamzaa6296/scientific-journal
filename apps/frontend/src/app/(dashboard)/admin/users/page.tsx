"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import usersService from "@/services/usersService";
import { formatDate, getErrorMessage } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  affiliation: string;
  isEmailVerified: boolean;
  createdAt: string;
  expertise: string[];
}

const ROLES = ["author", "reviewer", "editor", "admin"];

const ROLE_COLORS: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  admin: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  editor: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  reviewer: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  author: { bg: "#f5f5f0", color: "#525252", border: "#e5e5e5" },
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Change this user's role to "${newRole}"?`)) return;
    setUpdatingId(userId);
    setActionError("");
    setActionSuccess("");
    try {
      await usersService.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => {
          const uid = u._id || u.id;
          return uid === userId ? { ...u, role: newRole } : u;
        }),
      );
      setActionSuccess(`Role updated to "${newRole}" successfully.`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This action cannot be undone.`))
      return;
    setDeletingId(userId);
    setActionError("");
    setActionSuccess("");
    try {
      await usersService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
      setActionSuccess("User deleted successfully.");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.affiliation?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const roleCounts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px" }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary-900)",
            fontSize: "28px",
            margin: "0 0 4px",
          }}
        >
          User Management
        </h2>
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total",
            value: users.length,
            color: "var(--color-primary-900)",
          },
          {
            label: "Authors",
            value: roleCounts["author"] || 0,
            color: "#525252",
          },
          {
            label: "Reviewers",
            value: roleCounts["reviewer"] || 0,
            color: "#15803d",
          },
          {
            label: "Editors",
            value: roleCounts["editor"] || 0,
            color: "#1d4ed8",
          },
          {
            label: "Admins",
            value: roleCounts["admin"] || 0,
            color: "#b91c1c",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-200)",
              padding: "16px 20px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <p
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: stat.color,
                margin: "0 0 2px",
                fontFamily: "var(--font-sans)",
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-surface-500)",
                fontFamily: "var(--font-sans)",
                margin: 0,
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "14px",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or institution..."
            className="input-base"
            style={{ paddingLeft: "36px" }}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["all", ...ROLES].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                fontWeight: filterRole === role ? 600 : 400,
                borderRadius: "var(--radius-sm)",
                border: "1px solid",
                borderColor:
                  filterRole === role
                    ? "var(--color-primary-900)"
                    : "var(--color-surface-300)",
                backgroundColor:
                  filterRole === role ? "var(--color-primary-900)" : "white",
                color:
                  filterRole === role
                    ? "var(--color-accent-500)"
                    : "var(--color-surface-600)",
                cursor: "pointer",
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {role === "all" ? "All Roles" : role}
              {role !== "all" && roleCounts[role]
                ? ` (${roleCounts[role]})`
                : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Action messages */}
      {actionSuccess && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "var(--radius-sm)",
            padding: "12px 16px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#15803d",
            fontFamily: "var(--font-sans)",
          }}
        >
          ✓ {actionSuccess}
        </div>
      )}

      {(error || actionError) && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius-sm)",
            padding: "12px 16px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#b91c1c",
            fontFamily: "var(--font-sans)",
          }}
        >
          {error || actionError}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-surface-200)",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              margin: "0 0 8px",
            }}
          >
            No users found
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              margin: 0,
            }}
          >
            {searchQuery || filterRole !== "all"
              ? "Try adjusting your search or filter."
              : "No users registered yet."}
          </p>
        </div>
      )}

      {/* Users Table */}
      {filtered.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-surface-200)",
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
              gap: "0",
              padding: "12px 20px",
              backgroundColor: "var(--color-surface-50)",
              borderBottom: "1px solid var(--color-surface-200)",
            }}
          >
            {["User", "Email", "Role", "Joined", "Actions"].map((col) => (
              <p
                key={col}
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  color: "var(--color-surface-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: 0,
                }}
              >
                {col}
              </p>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((user, index) => {
            const uid = user._id || user.id;
            const isCurrentUser = uid === currentUser?.id;
            const isUpdating = updatingId === uid;
            const isDeleting = deletingId === uid;
            const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS["author"];

            return (
              <div
                key={uid}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
                  gap: "0",
                  padding: "16px 20px",
                  borderBottom:
                    index < filtered.length - 1
                      ? "1px solid var(--color-surface-100)"
                      : "none",
                  backgroundColor: isCurrentUser
                    ? "var(--color-primary-50)"
                    : "white",
                  transition: "background-color 0.15s",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentUser) {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-surface-50)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isCurrentUser
                    ? "var(--color-primary-50)"
                    : "white";
                }}
              >
                {/* User */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary-900)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-accent-500)",
                      fontSize: "14px",
                      fontWeight: 700,
                      fontFamily: "var(--font-sans)",
                      flexShrink: 0,
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--color-surface-800)",
                        fontFamily: "var(--font-sans)",
                        margin: "0 0 2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.name || "—"}
                      {isCurrentUser && (
                        <span
                          style={{
                            fontSize: "11px",
                            marginLeft: "6px",
                            color: "var(--color-primary-900)",
                            fontWeight: 500,
                          }}
                        >
                          (you)
                        </span>
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-surface-400)",
                        fontFamily: "var(--font-sans)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.affiliation || "No affiliation"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--color-surface-600)",
                      fontFamily: "var(--font-sans)",
                      margin: "0 0 3px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.email}
                  </p>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-sans)",
                      color: user.isEmailVerified ? "#15803d" : "#b91c1c",
                      fontWeight: 500,
                    }}
                  >
                    {user.isEmailVerified ? "✓ Verified" : "✗ Unverified"}
                  </span>
                </div>

                {/* Role */}
                <div>
                  {isCurrentUser ? (
                    <span
                      style={{
                        fontSize: "12px",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "999px",
                        backgroundColor: roleStyle.bg,
                        color: roleStyle.color,
                        border: `1px solid ${roleStyle.border}`,
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role}
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(uid, e.target.value)}
                      disabled={isUpdating}
                      style={{
                        fontSize: "12px",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        padding: "4px 8px",
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${roleStyle.border}`,
                        backgroundColor: roleStyle.bg,
                        color: roleStyle.color,
                        cursor: isUpdating ? "not-allowed" : "pointer",
                        outline: "none",
                        opacity: isUpdating ? 0.7 : 1,
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Joined */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-surface-400)",
                    fontFamily: "var(--font-sans)",
                    margin: 0,
                  }}
                >
                  {formatDate(user.createdAt)}
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {!isCurrentUser && (
                    <button
                      onClick={() => handleDelete(uid, user.name)}
                      disabled={isDeleting}
                      style={{
                        fontSize: "12px",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                        padding: "5px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid #fecaca",
                        backgroundColor: "transparent",
                        color: "#ef4444",
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                        opacity: isDeleting ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isDeleting) {
                          e.currentTarget.style.backgroundColor = "#fef2f2";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {isDeleting ? "..." : "Delete"}
                    </button>
                  )}

                  {isCurrentUser && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--color-surface-400)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
