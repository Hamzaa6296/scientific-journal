/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  journal: string;
  status: string;
  submissionDate: string | null;
  authors: { name: string; affiliation: string }[];
  keywords: string[];
  reviewRounds: any[];
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Papers" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "revision", label: "Revision" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "published", label: "Published" },
];

export default function EditorSubmissionsPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPapers();
  }, [filterStatus, currentPage]);

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      setError("");
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

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary-900)",
            fontSize: "28px",
            margin: "0 0 4px",
          }}
        >
          All Submissions
        </h2>
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Manage and review all submitted papers
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
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
              placeholder="Search by title, abstract or keywords..."
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
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: "24px",
          borderBottom: "1px solid var(--color-surface-200)",
          paddingBottom: "0",
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleStatusFilter(opt.value)}
            style={{
              padding: "8px 16px",
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

      {/* Empty State */}
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              marginBottom: "8px",
            }}
          >
            No papers found
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {filterStatus !== "all"
              ? `No papers with status "${filterStatus}"`
              : "No submissions yet."}
          </p>
        </div>
      )}

      {/* Papers List */}
      {!isLoading && papers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} onRefresh={fetchPapers} />
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

// ─── Paper Card Component ───────────────────────────────────────────────────

function PaperCard({
  paper,
  onRefresh,
}: {
  paper: Paper;
  onRefresh: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusBarColor: Record<string, string> = {
    published: "#6366f1",
    accepted: "#22c55e",
    rejected: "#ef4444",
    revision: "#f97316",
    under_review: "#f59e0b",
    submitted: "#3b82f6",
    draft: "var(--color-surface-300)",
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-surface-200)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          height: "4px",
          backgroundColor:
            statusBarColor[paper.status] || "var(--color-surface-200)",
        }}
      />

      <div style={{ padding: "20px 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            marginBottom: "10px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                fontSize: "17px",
                margin: "0 0 8px",
                lineHeight: 1.4,
              }}
            >
              {paper.title}
            </h3>

            <div
              style={{
                display: "flex",
                gap: "10px",
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
            </div>
          </div>
        </div>

        {/* Abstract preview */}
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-surface-600)",
            fontFamily: "var(--font-sans)",
            lineHeight: 1.6,
            margin: "0 0 14px",
          }}
        >
          {truncate(paper.abstract, 180)}
        </p>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
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
            {paper.reviewRounds?.length > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-surface-400)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Round {paper.reviewRounds.length}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                padding: "6px 14px",
                border: "1px solid var(--color-surface-300)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "var(--color-surface-600)",
                transition: "all 0.15s",
              }}
            >
              {isExpanded ? "Less ▲" : "Manage ▼"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded management panel */}
      {isExpanded && (
        <PaperManagementPanel paper={paper} onRefresh={onRefresh} />
      )}
    </div>
  );
}

// ─── Paper Management Panel ─────────────────────────────────────────────────

function PaperManagementPanel({
  paper,
  onRefresh,
}: {
  paper: Paper;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "status" | "reviewers" | "reviews"
  >("status");
  const [statusForm, setStatusForm] = useState({
    status: "",
    editorComments: "",
    editorNotes: "",
    doi: "",
    volume: "",
    issue: "",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [paperReviews, setPaperReviews] = useState<any>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    submitted: ["under_review", "rejected"],
    under_review: ["accepted", "revision", "rejected"],
    revision: ["under_review"],
    accepted: ["published"],
    rejected: [],
    published: [],
    draft: [],
  };

  const STATUS_LABELS: Record<string, string> = {
    under_review: "Move to Under Review",
    accepted: "Accept Paper",
    rejected: "Reject Paper",
    revision: "Request Revision",
    published: "Publish Paper",
  };

  const allowedStatuses = ALLOWED_TRANSITIONS[paper.status] || [];

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusForm.status) {
      setStatusError("Please select a new status");
      return;
    }

    setIsUpdatingStatus(true);
    setStatusError("");
    setStatusSuccess("");

    try {
      const payload: any = {
        status: statusForm.status,
        editorComments: statusForm.editorComments,
        editorNotes: statusForm.editorNotes,
      };
      if (statusForm.status === "published") {
        if (statusForm.doi) payload.doi = statusForm.doi;
        if (statusForm.volume) payload.volume = Number(statusForm.volume);
        if (statusForm.issue) payload.issue = Number(statusForm.issue);
      }
      await papersService.updateStatus(paper.id, payload);
      setStatusSuccess("Status updated successfully.");
      setStatusForm({
        status: "",
        editorComments: "",
        editorNotes: "",
        doi: "",
        volume: "",
        issue: "",
      });
      onRefresh();
    } catch (err) {
      setStatusError(getErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const loadReviewers = async () => {
    if (reviewers.length > 0) return;
    setIsLoadingReviewers(true);
    try {
      const data = await usersService.getReviewers();
      setReviewers(data);
    } catch (err) {
      setAssignError(getErrorMessage(err));
    } finally {
      setIsLoadingReviewers(false);
    }
  };

  const toggleReviewer = (id: string) => {
    setSelectedReviewerIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (selectedReviewerIds.length === 0) {
      setAssignError("Please select at least one reviewer");
      return;
    }
    setIsAssigning(true);
    setAssignError("");
    setAssignSuccess("");
    try {
      await reviewsService.assignReviewers(paper.id, selectedReviewerIds);
      setAssignSuccess(
        `${selectedReviewerIds.length} reviewer(s) assigned successfully.`,
      );
      setSelectedReviewerIds([]);
      onRefresh();
    } catch (err) {
      setAssignError(getErrorMessage(err));
    } finally {
      setIsAssigning(false);
    }
  };

  const loadReviews = async () => {
    if (paperReviews) return;
    setIsLoadingReviews(true);
    try {
      const data = await reviewsService.getPaperReviews(paper.id);
      setPaperReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleTabChange = (tab: "status" | "reviewers" | "reviews") => {
    setActiveTab(tab);
    if (tab === "reviewers") loadReviewers();
    if (tab === "reviews") loadReviews();
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--color-surface-200)",
        backgroundColor: "var(--color-surface-50)",
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-surface-200)",
          backgroundColor: "white",
        }}
      >
        {(["status", "reviewers", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: "12px 20px",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              fontWeight: activeTab === tab ? 600 : 400,
              color:
                activeTab === tab
                  ? "var(--color-primary-900)"
                  : "var(--color-surface-500)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom:
                activeTab === tab
                  ? "2px solid var(--color-primary-900)"
                  : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              textTransform: "capitalize",
            }}
          >
            {tab === "status"
              ? "⚙ Status"
              : tab === "reviewers"
                ? "👥 Reviewers"
                : "📝 Reviews"}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px" }}>
        {/* ── STATUS TAB ─────────────────────────────────────── */}
        {activeTab === "status" && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-surface-600)",
                }}
              >
                Current Status:
              </span>
              <Badge status={paper.status} />
            </div>

            {allowedStatuses.length === 0 ? (
              <div
                style={{
                  backgroundColor: "var(--color-surface-100)",
                  borderRadius: "var(--radius-sm)",
                  padding: "16px",
                  fontSize: "14px",
                  color: "var(--color-surface-500)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                No further status transitions available for this paper.
              </div>
            ) : (
              <form onSubmit={handleStatusUpdate}>
                {statusError && (
                  <div
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 14px",
                      marginBottom: "16px",
                      fontSize: "13px",
                      color: "#b91c1c",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {statusError}
                  </div>
                )}

                {statusSuccess && (
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 14px",
                      marginBottom: "16px",
                      fontSize: "13px",
                      color: "#15803d",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    ✓ {statusSuccess}
                  </div>
                )}

                {/* Status selector buttons */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={panelLabelStyle}>Move To</label>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {allowedStatuses.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setStatusForm({ ...statusForm, status: s })
                        }
                        style={{
                          padding: "8px 16px",
                          fontSize: "13px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 500,
                          borderRadius: "var(--radius-sm)",
                          border: "2px solid",
                          borderColor:
                            statusForm.status === s
                              ? "var(--color-primary-900)"
                              : "var(--color-surface-300)",
                          backgroundColor:
                            statusForm.status === s
                              ? "var(--color-primary-900)"
                              : "white",
                          color:
                            statusForm.status === s
                              ? "var(--color-accent-500)"
                              : "var(--color-surface-600)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {STATUS_LABELS[s] || s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor comments */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={panelLabelStyle}>
                    Message to Author
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--color-surface-400)",
                        marginLeft: "6px",
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={statusForm.editorComments}
                    onChange={(e) =>
                      setStatusForm({
                        ...statusForm,
                        editorComments: e.target.value,
                      })
                    }
                    placeholder="Explain your decision to the author..."
                    rows={3}
                    className="input-base"
                    style={{ resize: "vertical", lineHeight: 1.6 }}
                  />
                </div>

                {/* Private notes */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={panelLabelStyle}>
                    Internal Notes
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--color-surface-400)",
                        marginLeft: "6px",
                      }}
                    >
                      (only visible to editors)
                    </span>
                  </label>
                  <textarea
                    value={statusForm.editorNotes}
                    onChange={(e) =>
                      setStatusForm({
                        ...statusForm,
                        editorNotes: e.target.value,
                      })
                    }
                    placeholder="Private notes for editorial team..."
                    rows={2}
                    className="input-base"
                    style={{ resize: "vertical", lineHeight: 1.6 }}
                  />
                </div>

                {/* Publishing fields */}
                {statusForm.status === "published" && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
                      <label style={panelLabelStyle}>DOI</label>
                      <input
                        type="text"
                        value={statusForm.doi}
                        onChange={(e) =>
                          setStatusForm({ ...statusForm, doi: e.target.value })
                        }
                        placeholder="10.1234/journal.001"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label style={panelLabelStyle}>Volume</label>
                      <input
                        type="number"
                        value={statusForm.volume}
                        onChange={(e) =>
                          setStatusForm({
                            ...statusForm,
                            volume: e.target.value,
                          })
                        }
                        placeholder="1"
                        min="1"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label style={panelLabelStyle}>Issue</label>
                      <input
                        type="number"
                        value={statusForm.issue}
                        onChange={(e) =>
                          setStatusForm({
                            ...statusForm,
                            issue: e.target.value,
                          })
                        }
                        placeholder="1"
                        min="1"
                        className="input-base"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUpdatingStatus || !statusForm.status}
                  className="btn-primary"
                  style={{ minWidth: "140px" }}
                >
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── REVIEWERS TAB ───────────────────────────────────── */}
        {activeTab === "reviewers" && (
          <div>
            {paper.status !== "under_review" && (
              <div
                style={{
                  backgroundColor: "#fefce8",
                  border: "1px solid #fef08a",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 16px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#854d0e",
                  fontFamily: "var(--font-sans)",
                }}
              >
                ⚠ Reviewers can only be assigned when the paper is "Under
                Review". First move the paper to that status.
              </div>
            )}

            {assignError && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#b91c1c",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {assignError}
              </div>
            )}

            {assignSuccess && (
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#15803d",
                  fontFamily: "var(--font-sans)",
                }}
              >
                ✓ {assignSuccess}
              </div>
            )}

            {isLoadingReviewers ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "32px",
                }}
              >
                <Spinner size="md" />
              </div>
            ) : reviewers.length === 0 ? (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  backgroundColor: "var(--color-surface-100)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  color: "var(--color-surface-500)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>👥</div>
                No reviewers registered yet. Create reviewer accounts first.
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={panelLabelStyle}>
                    Select Reviewers ({selectedReviewerIds.length} selected)
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    marginBottom: "16px",
                  }}
                >
                  {reviewers.map((reviewer) => {
                    const isSelected = selectedReviewerIds.includes(
                      reviewer._id || reviewer.id,
                    );
                    const rid = reviewer._id || reviewer.id;

                    return (
                      <div
                        key={rid}
                        onClick={() =>
                          paper.status === "under_review" && toggleReviewer(rid)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid",
                          borderColor: isSelected
                            ? "var(--color-primary-900)"
                            : "var(--color-surface-200)",
                          backgroundColor: isSelected
                            ? "var(--color-primary-50)"
                            : "white",
                          cursor:
                            paper.status === "under_review"
                              ? "pointer"
                              : "not-allowed",
                          transition: "all 0.15s",
                          opacity: paper.status !== "under_review" ? 0.6 : 1,
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "4px",
                            border: "2px solid",
                            borderColor: isSelected
                              ? "var(--color-primary-900)"
                              : "var(--color-surface-300)",
                            backgroundColor: isSelected
                              ? "var(--color-primary-900)"
                              : "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                        >
                          {isSelected && (
                            <span
                              style={{
                                color: "white",
                                fontSize: "11px",
                                lineHeight: 1,
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
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
                          {reviewer.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "var(--color-surface-800)",
                              fontFamily: "var(--font-sans)",
                              margin: "0 0 2px",
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
                            }}
                          >
                            {reviewer.affiliation || reviewer.email}
                          </p>
                          {reviewer.expertise?.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                gap: "4px",
                                flexWrap: "wrap",
                                marginTop: "4px",
                              }}
                            >
                              {reviewer.expertise
                                .slice(0, 3)
                                .map((exp: string) => (
                                  <span
                                    key={exp}
                                    style={{
                                      fontSize: "11px",
                                      backgroundColor:
                                        "var(--color-surface-100)",
                                      color: "var(--color-surface-600)",
                                      padding: "1px 8px",
                                      borderRadius: "999px",
                                      fontFamily: "var(--font-sans)",
                                      border:
                                        "1px solid var(--color-surface-200)",
                                    }}
                                  >
                                    {exp}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleAssign}
                  disabled={
                    isAssigning ||
                    selectedReviewerIds.length === 0 ||
                    paper.status !== "under_review"
                  }
                  className="btn-primary"
                  style={{ minWidth: "160px" }}
                >
                  {isAssigning
                    ? "Assigning..."
                    : `Assign ${selectedReviewerIds.length > 0 ? `(${selectedReviewerIds.length})` : ""} Reviewer${selectedReviewerIds.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ─────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div>
            {isLoadingReviews ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "32px",
                }}
              >
                <Spinner size="md" />
              </div>
            ) : !paperReviews || paperReviews.reviewRounds?.length === 0 ? (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  backgroundColor: "var(--color-surface-100)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  color: "var(--color-surface-500)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📝</div>
                No reviews yet for this paper.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {paperReviews.reviewRounds.map((round: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-surface-200)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Round header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        backgroundColor: "var(--color-surface-100)",
                        borderBottom: "1px solid var(--color-surface-200)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: "var(--font-sans)",
                          color: "var(--color-primary-900)",
                        }}
                      >
                        Round {round.round}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--color-surface-500)",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          {round.reviews?.filter((r: any) => r.isSubmitted)
                            .length || 0}
                          /{round.reviews?.length || 0} submitted
                        </span>
                        {round.editorDecision && (
                          <Badge status={round.editorDecision} />
                        )}
                      </div>
                    </div>

                    {/* Reviews */}
                    <div style={{ padding: "16px" }}>
                      {round.reviews?.length === 0 ? (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--color-surface-500)",
                            fontFamily: "var(--font-sans)",
                            margin: 0,
                          }}
                        >
                          No reviewers assigned yet.
                        </p>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          {round.reviews.map((review: any, j: number) => (
                            <ReviewCard
                              key={j}
                              review={review}
                              index={j}
                              paperId={paper.id}
                              onRefresh={() => {
                                setPaperReviews(null);
                                loadReviews();
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Review Card Component ──────────────────────────────────────────────────

function ReviewCard({
  review,
  index,
  paperId,
  onRefresh,
}: {
  review: any;
  index: number;
  paperId: string;
  onRefresh: () => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (!confirm("Remove this reviewer from the current round?")) return;
    setIsRemoving(true);
    try {
      await reviewsService.removeReviewer(paperId, review.reviewerId);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsRemoving(false);
    }
  };

  const DECISION_COLORS: Record<string, string> = {
    accept: "#22c55e",
    minor_revision: "#f59e0b",
    major_revision: "#f97316",
    reject: "#ef4444",
  };

  return (
    <div
      style={{
        border: "1px solid var(--color-surface-200)",
        borderRadius: "var(--radius-sm)",
        padding: "14px 16px",
        backgroundColor: review.isSubmitted ? "white" : "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: review.isSubmitted ? "12px" : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary-900)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-accent-500)",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-sans)",
              flexShrink: 0,
            }}
          >
            {review.reviewerName?.charAt(0)?.toUpperCase() || index + 1}
          </div>
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--color-surface-800)",
                fontFamily: "var(--font-sans)",
                margin: 0,
              }}
            >
              {review.reviewerName || `Reviewer ${index + 1}`}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: review.isSubmitted
                  ? "#22c55e"
                  : "var(--color-surface-400)",
                fontFamily: "var(--font-sans)",
                margin: 0,
              }}
            >
              {review.isSubmitted
                ? `Submitted ${formatDate(review.submittedAt)}`
                : "Pending review"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {review.isSubmitted && review.score !== null && (
            <span
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-surface-600)",
                fontWeight: 500,
              }}
            >
              Score: <strong>{review.score}/10</strong>
            </span>
          )}
          {review.isSubmitted && review.decision && (
            <span
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                color:
                  DECISION_COLORS[review.decision] ||
                  "var(--color-surface-600)",
                backgroundColor: `${DECISION_COLORS[review.decision]}15`,
                padding: "3px 10px",
                borderRadius: "999px",
                border: `1px solid ${DECISION_COLORS[review.decision]}30`,
              }}
            >
              {review.decision.replace("_", " ")}
            </span>
          )}
          {!review.isSubmitted && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                color: "#ef4444",
                backgroundColor: "transparent",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-sm)",
                padding: "4px 10px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </button>
          )}
        </div>
      </div>

      {/* Review content */}
      {review.isSubmitted && (
        <div style={{ marginTop: "10px" }}>
          {review.comments && (
            <div style={{ marginBottom: "10px" }}>
              <p
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  color: "var(--color-surface-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Comments to Author
              </p>
              <p
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-surface-700)",
                  lineHeight: 1.7,
                  margin: 0,
                  backgroundColor: "var(--color-surface-50)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-surface-200)",
                }}
              >
                {review.comments}
              </p>
            </div>
          )}

          {review.privateNotes && (
            <div>
              <p
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  color: "#b45309",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Private Notes (Editor Only)
              </p>
              <p
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  color: "#92400e",
                  lineHeight: 1.7,
                  margin: 0,
                  backgroundColor: "#fefce8",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid #fef08a",
                }}
              >
                {review.privateNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shared styles ──────────────────────────────────────────────────────────

import reviewsService from "@/services/reviewsService";
import usersService from "@/services/usersService";

const panelLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--color-surface-700)",
  fontFamily: "var(--font-sans)",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
