/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import papersService from "@/services/papersService";
import { formatDate, getErrorMessage } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import PdfUpload from "@/components/ui/PdfUpload";
import Link from "next/link";

function PaperDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const paperId = params.id as string;
  const showRevise = searchParams.get("action") === "revise";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paper, setPaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [revisionUrl, setRevisionUrl] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionSuccess, setRevisionSuccess] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(showRevise);

  const fetchPaper = async () => {
    try {
      setIsLoading(true);
      const data = await papersService.getPaperById(paperId);
      setPaper(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPaper = async () => {
      try {
        setIsLoading(true);
        const data = await papersService.getPaperById(paperId);
        if (isMounted) {
          setPaper(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPaper();

    return () => {
      isMounted = false;
    };
  }, [paperId]);

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionUrl) {
      alert("Please provide the revised paper URL");
      return;
    }

    setIsSubmittingRevision(true);
    try {
      await papersService.submitRevision(paperId, {
        fileUrl: revisionUrl,
        revisionNote,
      });
      setRevisionSuccess("Revision submitted successfully!");
      setShowRevisionForm(false);
      await fetchPaper();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px" }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <p style={{ color: "#ef4444", fontFamily: "var(--font-sans)" }}>
          {error || "Paper not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="btn-secondary"
          style={{ marginTop: "16px" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Back */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/author/submissions"
          style={{
            fontSize: "13px",
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            textDecoration: "none",
          }}
        >
          ← My Submissions
        </Link>
      </div>

      {/* Success */}
      {revisionSuccess && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "var(--radius-sm)",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "#15803d",
            fontFamily: "var(--font-sans)",
          }}
        >
          ✓ {revisionSuccess}
        </div>
      )}

      {/* Header card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-surface-200)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            height: "6px",
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
                          : "var(--color-surface-300)",
          }}
        />
        <div style={{ padding: "28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                fontSize: "22px",
                margin: 0,
                lineHeight: 1.4,
                flex: 1,
              }}
            >
              {paper.title}
            </h2>
            <Badge status={paper.status} />
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "Category", value: paper.category },
              { label: "Journal", value: paper.journal || "Not specified" },
              { label: "Submitted", value: formatDate(paper.submissionDate) },
              {
                label: "Published",
                value: paper.publishedDate
                  ? formatDate(paper.publishedDate)
                  : null,
              },
              { label: "DOI", value: paper.doi || null },
            ]
              .filter((i) => i.value)
              .map((item) => (
                <div key={item.label}>
                  <p
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-surface-400)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      margin: "0 0 2px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-surface-800)",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
          </div>

          {/* Keywords */}
          {paper.keywords?.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {paper.keywords.map((kw: string) => (
                <span
                  key={kw}
                  style={{
                    backgroundColor: "var(--color-surface-100)",
                    color: "var(--color-surface-600)",
                    padding: "3px 12px",
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

          {/* Abstract */}
          <div
            style={{
              backgroundColor: "var(--color-surface-100)",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              borderLeft: "3px solid var(--color-primary-900)",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-surface-500)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              Abstract
            </p>
            <p
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-surface-700)",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {paper.abstract}
            </p>
          </div>

          {/* File link */}
          {paper.fileUrl && (
            <div style={{ marginTop: "16px" }}>
              <a
                href={paper.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  padding: "8px 16px",
                  textDecoration: "none",
                }}
              >
                📄 View Paper PDF ↗
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Revision form */}
      {paper.status === "revision" && (
        <div
          style={{
            backgroundColor: "#fff7ed",
            borderRadius: "var(--radius-md)",
            border: "1px solid #fed7aa",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "#c2410c",
              fontSize: "18px",
              marginBottom: "8px",
            }}
          >
            Revision Required
          </h3>
          {paper.reviewRounds?.length > 0 && (
            <p
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
                color: "#9a3412",
                marginBottom: "16px",
                lineHeight: 1.6,
              }}
            >
              <strong>Editor comments:</strong>{" "}
              {paper.reviewRounds[paper.reviewRounds.length - 1]
                ?.editorComments || "Please address the reviewer comments."}
            </p>
          )}
          {!showRevisionForm ? (
            <button
              onClick={() => setShowRevisionForm(true)}
              className="btn-primary"
              style={{ backgroundColor: "#f97316" }}
            >
              Submit Revision
            </button>
          ) : (
            <form onSubmit={handleSubmitRevision}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle }}>Revised Paper PDF *</label>
                <PdfUpload
                  value={revisionUrl}
                  onChange={(url) => setRevisionUrl(url)}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, color: "#9a3412" }}>
                  Response to Reviewers
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      marginLeft: "6px",
                      color: "#c2410c",
                    }}
                  >
                    (optional)
                  </span>
                </label>
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Describe what changes you made to address the reviewers' comments..."
                  rows={4}
                  className="input-base"
                  style={{ resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  disabled={isSubmittingRevision}
                  className="btn-primary"
                  style={{ backgroundColor: "#f97316" }}
                >
                  {isSubmittingRevision ? "Submitting..." : "Submit Revision"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRevisionForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review Rounds */}
      {paper.reviewRounds?.length > 0 && (
        <div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              fontSize: "20px",
              marginBottom: "16px",
            }}
          >
            Review History
          </h3>
          {paper.reviewRounds.map((round: any, i: number) => (
            <div
              key={i}
              style={{
                backgroundColor: "white",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-surface-200)",
                padding: "24px",
                marginBottom: "16px",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h4
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-primary-900)",
                    margin: 0,
                  }}
                >
                  Round {round.round}
                </h4>
                {round.editorDecision && (
                  <Badge status={round.editorDecision} />
                )}
              </div>

              {round.reviews?.length > 0 ? (
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-surface-500)",
                      marginBottom: "12px",
                    }}
                  >
                    {round.reviews.filter((r: any) => r.isSubmitted).length} of{" "}
                    {round.reviews.length} review(s) submitted
                  </p>
                  {round.reviews.map(
                    (review: any, j: number) =>
                      review.isSubmitted && (
                        <div
                          key={j}
                          style={{
                            backgroundColor: "var(--color-surface-100)",
                            borderRadius: "var(--radius-sm)",
                            padding: "16px",
                            marginBottom: "10px",
                            border: "1px solid var(--color-surface-200)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontFamily: "var(--font-sans)",
                                fontWeight: 600,
                                color: "var(--color-surface-700)",
                              }}
                            >
                              Reviewer {j + 1}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              {review.score && (
                                <span
                                  style={{
                                    fontSize: "13px",
                                    fontFamily: "var(--font-sans)",
                                    color: "var(--color-surface-600)",
                                  }}
                                >
                                  Score: <strong>{review.score}/10</strong>
                                </span>
                              )}
                              {review.decision && (
                                <Badge status={review.decision} />
                              )}
                            </div>
                          </div>
                          {review.comments && (
                            <p
                              style={{
                                fontSize: "14px",
                                fontFamily: "var(--font-sans)",
                                color: "var(--color-surface-700)",
                                lineHeight: 1.7,
                                margin: 0,
                              }}
                            >
                              {review.comments}
                            </p>
                          )}
                        </div>
                      ),
                  )}
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "14px",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-surface-500)",
                    marginBottom: "12px",
                  }}
                >
                  Reviews are pending...
                </p>
              )}

              {round.editorComments && (
                <div
                  style={{
                    backgroundColor: "var(--color-primary-50)",
                    borderRadius: "var(--radius-sm)",
                    padding: "14px 16px",
                    borderLeft: "3px solid var(--color-primary-900)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      color: "var(--color-primary-900)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}
                  >
                    Editor Decision
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-surface-700)",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {round.editorComments}
                  </p>
                  {round.decidedAt && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-surface-400)",
                        fontFamily: "var(--font-sans)",
                        marginTop: "6px",
                        margin: 0,
                      }}
                    >
                      {formatDate(round.decidedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PaperDetailPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{ display: "flex", justifyContent: "center", padding: "80px" }}
        >
          <Spinner size="lg" />
        </div>
      }
    >
      <PaperDetailContent />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-surface-700)",
  fontFamily: "var(--font-sans)",
  marginBottom: "6px",
};
