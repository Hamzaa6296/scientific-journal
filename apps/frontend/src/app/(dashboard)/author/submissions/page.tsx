"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import papersService from "@/services/papersService";
import { formatDate, truncate, getErrorMessage } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface ReviewRound {
  id: string;
  round: number;
  status: string;
  comments?: string;
  createdAt: string;
}

interface Paper {
  id: string;
  title: string;
  abstract: string;
  category: string;
  journal: string;
  status: string;
  submissionDate: string | null;
  publishedDate: string | null;
  keywords: string[];
  reviewRounds: ReviewRound[];
  createdAt: string;
  fileUrl: string;
}

export default function AuthorSubmissionsPage() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      const data = await papersService.getMySubmissions();
      setPapers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchPapers();
    })();
  }, []);

  const handleSubmit = async (paperId: string) => {
    if (
      !confirm(
        "Submit this paper for review? You will not be able to edit it after submission.",
      )
    )
      return;
    try {
      setSubmittingId(paperId);
      await papersService.submitPaper(paperId);
      await fetchPapers();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async (paperId: string) => {
    if (!confirm("Delete this draft? This action cannot be undone.")) return;
    try {
      setDeletingId(paperId);
      await papersService.deletePaper(paperId);
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesStatus =
      filterStatus === "all" || paper.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = papers.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
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
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              fontSize: "28px",
              margin: 0,
            }}
          >
            My Submissions
          </h2>
          <p
            style={{
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              marginTop: "4px",
            }}
          >
            Track and manage your research papers
          </p>
        </div>
        <a
          href="/author/submit"
          className="btn-primary"
          style={{ textDecoration: "none" }}
        >
          + New Submission
        </a>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total",
            value: papers.length,
            color: "var(--color-primary-900)",
          },
          {
            label: "Drafts",
            value: statusCounts["draft"] || 0,
            color: "#737373",
          },
          {
            label: "Submitted",
            value: statusCounts["submitted"] || 0,
            color: "#3b82f6",
          },
          {
            label: "In Review",
            value: statusCounts["under_review"] || 0,
            color: "#f59e0b",
          },
          {
            label: "Accepted",
            value: statusCounts["accepted"] || 0,
            color: "#22c55e",
          },
          {
            label: "Published",
            value: statusCounts["published"] || 0,
            color: "#6366f1",
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
                margin: 0,
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
                margin: "2px 0 0",
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
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base"
            style={{ paddingLeft: "36px" }}
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-base"
          style={{ width: "auto", minWidth: "160px" }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="revision">Revision Required</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="published">Published</option>
        </select>
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
      {filteredPapers.length === 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-surface-200)",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              marginBottom: "8px",
            }}
          >
            {papers.length === 0
              ? "No submissions yet"
              : "No papers match your filters"}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              marginBottom: "24px",
            }}
          >
            {papers.length === 0
              ? "Start by submitting your first research paper."
              : "Try adjusting your search or filter criteria."}
          </p>
          {papers.length === 0 && (
            <a
              href="/author/submit"
              className="btn-primary"
              style={{ textDecoration: "none" }}
            >
              Submit Your First Paper
            </a>
          )}
        </div>
      )}

      {/* Papers List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-200)",
              boxShadow: "var(--shadow-card)",
              overflow: "hidden",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "var(--shadow-card)")
            }
          >
            {/* Status bar at top */}
            <div
              style={{
                height: "4px",
                backgroundColor:
                  paper.status === "published"
                    ? "#6366f1"
                    : paper.status === "accepted"
                      ? "#22c55e"
                      : paper.status === "rejected"
                        ? "#ef4444"
                        : paper.status === "revision"
                          ? "#f97316"
                          : paper.status === "under_review"
                            ? "#f59e0b"
                            : paper.status === "submitted"
                              ? "#3b82f6"
                              : "var(--color-surface-200)",
              }}
            />

            <div style={{ padding: "20px 24px" }}>
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a
                    href={`/author/submissions/${paper.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--color-primary-900)",
                        fontSize: "17px",
                        margin: 0,
                        lineHeight: 1.4,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#4338ca")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          "var(--color-primary-900)")
                      }
                    >
                      {paper.title}
                    </h3>
                  </a>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "6px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Badge status={paper.status} />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--color-surface-400)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {paper.category}
                    </span>
                    {paper.journal && (
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--color-surface-400)",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        • {paper.journal}
                      </span>
                    )}
                  </div>
                </div>
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
                {truncate(paper.abstract, 200)}
              </p>

              {/* Keywords */}
              {paper.keywords?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                  }}
                >
                  {paper.keywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      style={{
                        backgroundColor: "var(--color-surface-100)",
                        color: "var(--color-surface-600)",
                        padding: "2px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontFamily: "var(--font-sans)",
                        border: "1px solid var(--color-surface-200)",
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {/* Dates */}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--color-surface-400)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Created: {formatDate(paper.createdAt)}
                  </span>
                  {paper.submissionDate && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--color-surface-400)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      Submitted: {formatDate(paper.submissionDate)}
                    </span>
                  )}
                  {paper.publishedDate && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6366f1",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                      }}
                    >
                      Published: {formatDate(paper.publishedDate)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <Link
                    href={`/author/submissions/${paper.id}`}
                    style={{
                      fontSize: "13px",
                      color: "var(--color-primary-900)",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      textDecoration: "none",
                      padding: "6px 14px",
                      border: "1px solid var(--color-primary-900)",
                      borderRadius: "var(--radius-sm)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-primary-900)";
                      e.currentTarget.style.color = "var(--color-accent-500)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--color-primary-900)";
                    }}
                  >
                    View Details
                  </Link>

                  {paper.status === "draft" && (
                    <>
                      <Link
                        href={`/author/submit?edit=${paper.id}`}
                        style={{
                          fontSize: "13px",
                          color: "var(--color-surface-600)",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 500,
                          textDecoration: "none",
                          padding: "6px 14px",
                          border: "1px solid var(--color-surface-300)",
                          borderRadius: "var(--radius-sm)",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-surface-100)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleSubmit(paper.id)}
                        disabled={!paper.fileUrl || submittingId === paper.id}
                        style={{
                          fontSize: "13px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 500,
                          padding: "6px 14px",
                          border: "none",
                          borderRadius: "var(--radius-sm)",
                          cursor: paper.fileUrl ? "pointer" : "not-allowed",
                          backgroundColor: paper.fileUrl
                            ? "#22c55e"
                            : "var(--color-surface-200)",
                          color: paper.fileUrl
                            ? "white"
                            : "var(--color-surface-400)",
                          transition: "all 0.15s",
                          opacity: submittingId === paper.id ? 0.7 : 1,
                        }}
                        title={
                          !paper.fileUrl
                            ? "Upload a PDF file before submitting"
                            : ""
                        }
                      >
                        {submittingId === paper.id ? "Submitting..." : "Submit"}
                      </button>

                      <button
                        onClick={() => handleDelete(paper.id)}
                        disabled={deletingId === paper.id}
                        style={{
                          fontSize: "13px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 500,
                          padding: "6px 14px",
                          border: "1px solid #fecaca",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                          color: "#ef4444",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#fef2f2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {deletingId === paper.id ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}

                  {paper.status === "revision" && (
                    <Link
                      href={`/author/submissions/${paper.id}?action=revise`}
                      style={{
                        fontSize: "13px",
                        color: "white",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                        textDecoration: "none",
                        padding: "6px 14px",
                        backgroundColor: "#f97316",
                        borderRadius: "var(--radius-sm)",
                        transition: "all 0.15s",
                      }}
                    >
                      Submit Revision
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
