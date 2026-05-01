/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect } from "react";
import usersService from "@/services/usersService";
import { getErrorMessage } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

interface Reviewer {
  id: string;
  _id: string;
  name: string;
  email: string;
  affiliation: string;
  expertise: string[];
  bio: string;
}

export default function ReviewerPoolPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getReviewers();
      setReviewers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = reviewers.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.affiliation?.toLowerCase().includes(q) ||
      r.expertise?.some((e) => e.toLowerCase().includes(q))
    );
  });

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
          Reviewer Pool
        </h2>
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          {reviewers.length} registered reviewer
          {reviewers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div
        style={{
          position: "relative",
          maxWidth: "400px",
          marginBottom: "24px",
        }}
      >
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
          placeholder="Search by name, expertise, institution..."
          className="input-base"
          style={{ paddingLeft: "36px" }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius-sm)",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "#b91c1c",
            fontFamily: "var(--font-sans)",
          }}
        >
          {error}
        </div>
      )}

      {/* Empty */}
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
              marginBottom: "8px",
            }}
          >
            {reviewers.length === 0
              ? "No reviewers yet"
              : "No reviewers match your search"}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {reviewers.length === 0
              ? "Reviewer accounts need to be created and assigned the reviewer role."
              : "Try a different search term."}
          </p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((reviewer) => {
            const rid = reviewer._id || reviewer.id;
            return (
              <div
                key={rid}
                style={{
                  backgroundColor: "white",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-surface-200)",
                  boxShadow: "var(--shadow-card)",
                  padding: "20px",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
              >
                {/* Avatar + Name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary-900)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-accent-500)",
                      fontSize: "18px",
                      fontWeight: 700,
                      fontFamily: "var(--font-sans)",
                      flexShrink: 0,
                    }}
                  >
                    {reviewer.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--color-primary-900)",
                        fontFamily: "var(--font-sans)",
                        margin: "0 0 2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {reviewer.name}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-surface-500)",
                        fontFamily: "var(--font-sans)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {reviewer.email}
                    </p>
                  </div>
                </div>

                {/* Affiliation */}
                {reviewer.affiliation && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--color-surface-600)",
                      fontFamily: "var(--font-sans)",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    🏛 {reviewer.affiliation}
                  </p>
                )}

                {/* Expertise */}
                {reviewer.expertise?.length > 0 && (
                  <div>
                    <p
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        color: "var(--color-surface-400)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "6px",
                      }}
                    >
                      Expertise
                    </p>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {reviewer.expertise.map((exp) => (
                        <span
                          key={exp}
                          style={{
                            fontSize: "12px",
                            backgroundColor: "var(--color-surface-100)",
                            color: "var(--color-surface-600)",
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontFamily: "var(--font-sans)",
                            border: "1px solid var(--color-surface-200)",
                          }}
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {reviewer.bio && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--color-surface-500)",
                      fontFamily: "var(--font-sans)",
                      lineHeight: 1.6,
                      marginTop: "12px",
                      marginBottom: 0,
                      borderTop: "1px solid var(--color-surface-100)",
                      paddingTop: "12px",
                    }}
                  >
                    {reviewer.bio.length > 120
                      ? reviewer.bio.slice(0, 120) + "..."
                      : reviewer.bio}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
