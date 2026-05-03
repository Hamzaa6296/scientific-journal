"use client";

import { useState, useEffect } from "react";
import reviewsService from "@/services/reviewsService";
import { formatDate, truncate, getErrorMessage } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface MyReview {
  round: number;
  myReview: {
    reviewerId: string;
    reviewerName: string;
    decision: string | null;
    comments: string;
    score: number | null;
    isSubmitted: boolean;
    submittedAt: string | null;
  };
  editorDecision: string | null;
  editorComments: string;
}

interface Assignment {
  paperId: string;
  title: string;
  abstract: string;
  category: string;
  status: string;
  fileUrl: string;
  rounds: MyReview[];
}

export default function ReviewerAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "submitted">(
    "all",
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await reviewsService.getMyReviews();
      setAssignments(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestRound = (assignment: Assignment): MyReview | null => {
    if (!assignment.rounds || assignment.rounds.length === 0) return null;
    return assignment.rounds[assignment.rounds.length - 1];
  };

  const filtered = assignments.filter((a) => {
    const latest = getLatestRound(a);
    if (filterTab === "pending") return latest && !latest.myReview.isSubmitted;
    if (filterTab === "submitted") return latest && latest.myReview.isSubmitted;
    return true;
  });

  const pendingCount = assignments.filter((a) => {
    const latest = getLatestRound(a);
    return latest && !latest.myReview.isSubmitted;
  }).length;

  const submittedCount = assignments.filter((a) => {
    const latest = getLatestRound(a);
    return latest && latest.myReview.isSubmitted;
  }).length;

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
          My Review Assignments
        </h2>
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Papers assigned to you for peer review
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total Assigned",
            value: assignments.length,
            color: "var(--color-primary-900)",
          },
          { label: "Pending Review", value: pendingCount, color: "#f59e0b" },
          { label: "Completed", value: submittedCount, color: "#22c55e" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-200)",
              padding: "20px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <p
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: stat.color,
                margin: "0 0 4px",
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

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-surface-200)",
          marginBottom: "24px",
          gap: "0",
        }}
      >
        {(
          [
            { key: "all", label: `All (${assignments.length})` },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "submitted", label: `Completed (${submittedCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontFamily: "var(--font-sans)",
              fontWeight: filterTab === tab.key ? 600 : 400,
              color:
                filterTab === tab.key
                  ? "var(--color-primary-900)"
                  : "var(--color-surface-500)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom:
                filterTab === tab.key
                  ? "2px solid var(--color-primary-900)"
                  : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              marginBottom: "8px",
              margin: "0 0 8px",
            }}
          >
            {assignments.length === 0
              ? "No assignments yet"
              : `No ${filterTab} assignments`}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              margin: 0,
            }}
          >
            {assignments.length === 0
              ? "You have not been assigned any papers to review yet."
              : "Try a different filter."}
          </p>
        </div>
      )}

      {/* Assignment Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filtered.map((assignment) => {
          const latest = getLatestRound(assignment);
          const isPending = latest && !latest.myReview.isSubmitted;
          const isSubmitted = latest && latest.myReview.isSubmitted;

          return (
            <div
              key={assignment.paperId}
              style={{
                backgroundColor: "white",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-surface-200)",
                boxShadow: "var(--shadow-card)",
                overflow: "hidden",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              {/* Status bar */}
              <div
                style={{
                  height: "4px",
                  backgroundColor: isPending
                    ? "#f59e0b"
                    : isSubmitted
                      ? "#22c55e"
                      : "var(--color-surface-200)",
                }}
              />

              <div style={{ padding: "20px 24px" }}>
                {/* Title row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    marginBottom: "10px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--color-primary-900)",
                      fontSize: "17px",
                      margin: 0,
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {assignment.title}
                  </h3>

                  {/* Review status badge */}
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      backgroundColor: isPending ? "#fefce8" : "#f0fdf4",
                      color: isPending ? "#854d0e" : "#15803d",
                      border: `1px solid ${isPending ? "#fef08a" : "#bbf7d0"}`,
                    }}
                  >
                    {isPending ? "⏳ Pending" : "✓ Submitted"}
                  </span>
                </div>

                {/* Meta */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <Badge status={assignment.status} />
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--color-surface-400)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {assignment.category}
                  </span>
                  {latest && (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--color-surface-400)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      Round {latest.round}
                    </span>
                  )}
                </div>

                {/* Abstract */}
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--color-surface-600)",
                    fontFamily: "var(--font-sans)",
                    lineHeight: 1.6,
                    margin: "0 0 16px",
                  }}
                >
                  {truncate(assignment.abstract, 200)}
                </p>

                {/* Review summary (if submitted) */}
                {isSubmitted && latest?.myReview && (
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 16px",
                      marginBottom: "16px",
                      display: "flex",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 600,
                          color: "#15803d",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          margin: "0 0 2px",
                        }}
                      >
                        Your Decision
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 600,
                          color: "#166534",
                          margin: 0,
                          textTransform: "capitalize",
                        }}
                      >
                        {latest.myReview.decision?.replace(/_/g, " ") || "—"}
                      </p>
                    </div>
                    {latest.myReview.score !== null && (
                      <div>
                        <p
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                            color: "#15803d",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            margin: "0 0 2px",
                          }}
                        >
                          Score
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                            color: "#166534",
                            margin: 0,
                          }}
                        >
                          {latest.myReview.score}/10
                        </p>
                      </div>
                    )}
                    {latest.myReview.submittedAt && (
                      <div>
                        <p
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 600,
                            color: "#15803d",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            margin: "0 0 2px",
                          }}
                        >
                          Submitted
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            fontFamily: "var(--font-sans)",
                            color: "#166534",
                            margin: 0,
                          }}
                        >
                          {formatDate(latest.myReview.submittedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <Link
                    href={`/reviewer/assignments/${assignment.paperId}`}
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      textDecoration: "none",
                      padding: "8px 18px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: isPending
                        ? "var(--color-primary-900)"
                        : "transparent",
                      color: isPending
                        ? "var(--color-accent-500)"
                        : "var(--color-primary-900)",
                      border: isPending
                        ? "none"
                        : "1px solid var(--color-primary-900)",
                      transition: "all 0.15s",
                    }}
                  >
                    {isPending ? "📝 Write Review" : "👁 View Details"}
                  </Link>

                  {assignment.fileUrl && (
                    <Link
                      href={assignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "13px",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                        textDecoration: "none",
                        padding: "8px 18px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "transparent",
                        color: "var(--color-surface-600)",
                        border: "1px solid var(--color-surface-300)",
                        transition: "all 0.15s",
                      }}
                    >
                      📄 Read Paper
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
