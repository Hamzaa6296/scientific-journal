/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect } from "react";
import papersService from "@/services/papersService";
import { formatDate, truncate, getErrorMessage } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  category: string;
  status: string;
  submissionDate: string | null;
  authors: { name: string; affiliation: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviewRounds: any[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "revision", label: "Revision" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "published", label: "Published" },
];

export default function AdminPapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, currentPage]);

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      setError("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { page: currentPage, limit: 10 };
      if (filterStatus !== "all") params.status = filterStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await papersService.getAllPapers(params);
      setPapers(data.papers);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPapers();
  };

  const handleDelete = async (paperId: string, title: string) => {
    if (!confirm(`Delete paper "${title}"? This cannot be undone.`)) return;
    setDeletingId(paperId);
    try {
      await papersService.deletePaper(paperId);
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const STATUS_BAR_COLORS: Record<string, string> = {
    published: "#6366f1",
    accepted: "#22c55e",
    rejected: "#ef4444",
    revision: "#f97316",
    under_review: "#f59e0b",
    submitted: "#3b82f6",
    draft: "var(--color-surface-300)",
  };

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
          All Papers
        </h2>
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Full administrative access to all submissions
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1, position: "relative" }}>
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
              placeholder="Search papers..."
              className="input-base"
              style={{ paddingLeft: "36px" }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: "10px 20px" }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          marginBottom: "24px",
          borderBottom: "1px solid var(--color-surface-200)",
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setFilterStatus(opt.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px 14px",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              fontWeight: filterStatus === opt.value ? 600 : 400,
              color:
                filterStatus === opt.value
                  ? "var(--color-primary-900)"
                  : "var(--color-surface-500)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom:
                filterStatus === opt.value
                  ? "2px solid var(--color-primary-900)"
                  : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: "-1px",
            }}
          >
            {opt.label}
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

      {/* Loading */}
      {isLoading && (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && papers.length === 0 && (
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
              margin: "0 0 8px",
            }}
          >
            No papers found
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              margin: 0,
            }}
          >
            {filterStatus !== "all"
              ? `No papers with status "${filterStatus}"`
              : "No papers submitted yet."}
          </p>
        </div>
      )}

      {/* Papers */}
      {!isLoading && papers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {papers.map((paper) => (
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
                  backgroundColor:
                    STATUS_BAR_COLORS[paper.status] ||
                    "var(--color-surface-200)",
                }}
              />

              <div style={{ padding: "18px 22px" }}>
                {/* Title + Badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    marginBottom: "8px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--color-primary-900)",
                      fontSize: "16px",
                      margin: 0,
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {paper.title}
                  </h3>
                  <Badge status={paper.status} />
                </div>

                {/* Meta */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--color-surface-400)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {paper.category}
                  </span>
                  {paper.authors?.length > 0 && (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--color-surface-500)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      by {paper.authors.map((a) => a.name).join(", ")}
                    </span>
                  )}
                  {paper.submissionDate && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--color-surface-400)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {formatDate(paper.submissionDate)}
                    </span>
                  )}
                </div>

                {/* Abstract */}
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-surface-500)",
                    fontFamily: "var(--font-sans)",
                    lineHeight: 1.6,
                    margin: "0 0 14px",
                  }}
                >
                  {truncate(paper.abstract, 160)}
                </p>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <a
                    href={`/editor/submissions`}
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      textDecoration: "none",
                      padding: "5px 12px",
                      border: "1px solid var(--color-primary-900)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--color-primary-900)",
                      backgroundColor: "transparent",
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
                    Manage
                  </a>

                  <button
                    onClick={() => handleDelete(paper.id, paper.title)}
                    disabled={deletingId === paper.id}
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      padding: "5px 12px",
                      border: "1px solid #fecaca",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "transparent",
                      color: "#ef4444",
                      cursor:
                        deletingId === paper.id ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                      opacity: deletingId === paper.id ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (deletingId !== paper.id) {
                        e.currentTarget.style.backgroundColor = "#fef2f2";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {deletingId === paper.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "32px",
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            ← Prev
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid",
                  borderColor:
                    currentPage === page
                      ? "var(--color-primary-900)"
                      : "var(--color-surface-300)",
                  backgroundColor:
                    currentPage === page ? "var(--color-primary-900)" : "white",
                  color:
                    currentPage === page ? "white" : "var(--color-surface-600)",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={currentPage === pagination.totalPages}
            className="btn-secondary"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
