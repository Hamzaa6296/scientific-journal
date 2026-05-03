"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import reviewsService from "@/services/reviewsService";
import { formatDate, getErrorMessage } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

const DECISIONS = [
  {
    value: "accept",
    label: "Accept",
    description: "Paper is ready for publication as is.",
    color: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    value: "minor_revision",
    label: "Minor Revision",
    description: "Small changes needed before acceptance.",
    color: "#f59e0b",
    bg: "#fefce8",
    border: "#fef08a",
  },
  {
    value: "major_revision",
    label: "Major Revision",
    description: "Significant work required before acceptance.",
    color: "#f97316",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  {
    value: "reject",
    label: "Reject",
    description: "Paper does not meet publication standards.",
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
  },
];

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paper, setPaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    decision: "",
    comments: "",
    privateNotes: "",
    score: 0,
  });

  const [formErrors, setFormErrors] = useState({
    decision: "",
    comments: "",
    score: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [isResponding, setIsResponding] = useState(false);
  const [respondError, setRespondError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchPaper();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  const fetchPaper = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await reviewsService.getPaperForReview(paperId);
      setPaper(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getMyReview = () => {
    if (!paper?.reviewRounds?.length) return null;
    const latest = paper.reviewRounds[paper.reviewRounds.length - 1];
    if (!latest?.reviews?.length) return null;
    return latest.reviews[0];
  };

  const myReview = getMyReview();
  const alreadySubmitted = myReview?.isSubmitted === true;

  const handleRespond = async (accepted: boolean) => {
    setIsResponding(true);
    setRespondError("");
    try {
      await reviewsService.respondToInvitation(paperId, accepted);
      if (!accepted) {
        router.push("/reviewer/assignments");
      } else {
        await fetchPaper();
      }
    } catch (err) {
      setRespondError(getErrorMessage(err));
    } finally {
      setIsResponding(false);
    }
  };

  const validate = (): boolean => {
    const errors = { decision: "", comments: "", score: "" };
    let valid = true;

    if (!form.decision) {
      errors.decision = "Please select a recommendation";
      valid = false;
    }

    if (!form.comments.trim()) {
      errors.comments = "Review comments are required";
      valid = false;
    } else if (form.comments.trim().length < 50) {
      errors.comments = `Comments must be at least 50 characters (currently ${form.comments.trim().length})`;
      valid = false;
    }

    if (!form.score || form.score < 1 || form.score > 10) {
      errors.score = "Please provide a score between 1 and 10";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await reviewsService.submitReview(paperId, {
        decision: form.decision,
        comments: form.comments,
        privateNotes: form.privateNotes,
        score: form.score,
      });
      setSubmitSuccess("Your review has been submitted successfully.");
      await fetchPaper();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
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
      <div
        style={{
          textAlign: "center",
          padding: "80px",
        }}
      >
        <p
          style={{
            color: "#ef4444",
            fontFamily: "var(--font-sans)",
            marginBottom: "16px",
          }}
        >
          {error || "Paper not found"}
        </p>
        <button onClick={() => router.back()} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "860px" }}>
      {/* Back link */}
      <div style={{ marginBottom: "20px" }}>
        <a
          href="/reviewer/assignments"
          style={{
            fontSize: "13px",
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            textDecoration: "none",
          }}
        >
          ← My Assignments
        </a>
      </div>

      {/* Paper Info Card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-surface-200)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-primary-900)",
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-accent-500)",
                fontSize: "20px",
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
              marginTop: "12px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {paper.category}
            </span>
            {paper.journal && (
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {paper.journal}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {/* Abstract */}
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                color: "var(--color-surface-400)",
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

          {/* Keywords */}
          {paper.keywords?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <p
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  color: "var(--color-surface-400)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                }}
              >
                Keywords
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {paper.keywords.map((kw: string) => (
                  <span
                    key={kw}
                    style={{
                      fontSize: "12px",
                      backgroundColor: "var(--color-surface-100)",
                      color: "var(--color-surface-600)",
                      padding: "3px 12px",
                      borderRadius: "999px",
                      fontFamily: "var(--font-sans)",
                      border: "1px solid var(--color-surface-200)",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Read paper button */}
          {paper.fileUrl && (
            <a
              href={paper.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                fontSize: "13px",
                padding: "8px 18px",
              }}
            >
              📄 Read Full Paper ↗
            </a>
          )}
        </div>
      </div>

      {/* Already Submitted View */}
      {alreadySubmitted && myReview && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid #bbf7d0",
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: "#f0fdf4",
              padding: "16px 24px",
              borderBottom: "1px solid #bbf7d0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "20px" }}>✅</span>
            <div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#15803d",
                  fontFamily: "var(--font-sans)",
                  margin: 0,
                }}
              >
                Review Submitted
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#16a34a",
                  fontFamily: "var(--font-sans)",
                  margin: 0,
                }}
              >
                {formatDate(myReview.submittedAt)}
              </p>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            {/* Decision and score */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--color-surface-50)",
                  borderRadius: "var(--radius-sm)",
                  padding: "16px",
                  border: "1px solid var(--color-surface-200)",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    color: "var(--color-surface-400)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: "0 0 6px",
                  }}
                >
                  Your Recommendation
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-primary-900)",
                    margin: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {myReview.decision?.replace(/_/g, " ") || "—"}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface-50)",
                  borderRadius: "var(--radius-sm)",
                  padding: "16px",
                  border: "1px solid var(--color-surface-200)",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    color: "var(--color-surface-400)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: "0 0 6px",
                  }}
                >
                  Quality Score
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-primary-900)",
                    margin: 0,
                  }}
                >
                  {myReview.score !== null ? `${myReview.score} / 10` : "—"}
                </p>
              </div>
            </div>

            {/* Comments */}
            {myReview.comments && (
              <div style={{ marginBottom: "16px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    color: "var(--color-surface-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                  }}
                >
                  Your Comments to Author
                </p>
                <div
                  style={{
                    backgroundColor: "var(--color-surface-50)",
                    borderRadius: "var(--radius-sm)",
                    padding: "14px 16px",
                    border: "1px solid var(--color-surface-200)",
                    fontSize: "14px",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-surface-700)",
                    lineHeight: 1.8,
                  }}
                >
                  {myReview.comments}
                </div>
              </div>
            )}

            {/* Private notes */}
            {myReview.privateNotes && (
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    color: "#b45309",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                  }}
                >
                  Your Private Notes
                </p>
                <div
                  style={{
                    backgroundColor: "#fefce8",
                    borderRadius: "var(--radius-sm)",
                    padding: "14px 16px",
                    border: "1px solid #fef08a",
                    fontSize: "14px",
                    fontFamily: "var(--font-sans)",
                    color: "#92400e",
                    lineHeight: 1.8,
                  }}
                >
                  {myReview.privateNotes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Form (not yet submitted) */}
      {!alreadySubmitted && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-surface-200)",
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-primary-900)",
              padding: "20px 28px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-accent-500)",
                fontSize: "18px",
                margin: 0,
              }}
            >
              Submit Your Review
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                marginTop: "4px",
                marginBottom: 0,
              }}
            >
              Your review is confidential and will only be shared with the
              editor.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
            {/* Accept/Decline invitation */}
            {respondError && (
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
                {respondError}
              </div>
            )}

            {/* Success */}
            {submitSuccess && (
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
                ✓ {submitSuccess}
              </div>
            )}

            {/* Submit error */}
            {submitError && (
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
                {submitError}
              </div>
            )}

            {/* Decline invitation notice */}
            <div
              style={{
                backgroundColor: "#fefce8",
                border: "1px solid #fef08a",
                borderRadius: "var(--radius-sm)",
                padding: "14px 16px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  color: "#854d0e",
                  margin: 0,
                }}
              >
                Unable to review this paper? You can decline the assignment.
              </p>
              <button
                type="button"
                onClick={() => handleRespond(false)}
                disabled={isResponding}
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  padding: "6px 14px",
                  border: "1px solid #fcd34d",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "white",
                  color: "#92400e",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {isResponding ? "Processing..." : "Decline Assignment"}
              </button>
            </div>

            {/* Recommendation */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Recommendation *</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                {DECISIONS.map((d) => (
                  <div
                    key={d.value}
                    onClick={() => setForm({ ...form, decision: d.value })}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-sm)",
                      border: "2px solid",
                      borderColor:
                        form.decision === d.value
                          ? d.color
                          : "var(--color-surface-200)",
                      backgroundColor:
                        form.decision === d.value ? d.bg : "white",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor:
                            form.decision === d.value
                              ? d.color
                              : "var(--color-surface-300)",
                          backgroundColor:
                            form.decision === d.value ? d.color : "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {form.decision === d.value && (
                          <span
                            style={{
                              color: "white",
                              fontSize: "10px",
                              lineHeight: 1,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: "var(--font-sans)",
                          color:
                            form.decision === d.value
                              ? d.color
                              : "var(--color-surface-700)",
                        }}
                      >
                        {d.label}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        fontFamily: "var(--font-sans)",
                        color:
                          form.decision === d.value
                            ? d.color
                            : "var(--color-surface-400)",
                        margin: "0 0 0 28px",
                      }}
                    >
                      {d.description}
                    </p>
                  </div>
                ))}
              </div>
              {formErrors.decision && (
                <p style={errorStyle}>{formErrors.decision}</p>
              )}
            </div>

            {/* Score */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>
                Overall Score *
                <span
                  style={{
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "8px",
                    fontSize: "12px",
                  }}
                >
                  1 = Poor, 10 = Excellent
                </span>
              </label>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, score: n })}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-sm)",
                      border: "2px solid",
                      borderColor:
                        form.score === n
                          ? "var(--color-primary-900)"
                          : "var(--color-surface-200)",
                      backgroundColor:
                        form.score === n ? "var(--color-primary-900)" : "white",
                      color:
                        form.score === n ? "white" : "var(--color-surface-600)",
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: "var(--font-sans)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {form.score > 0 && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-surface-500)",
                    fontFamily: "var(--font-sans)",
                    marginTop: "8px",
                  }}
                >
                  {form.score <= 3 && "Poor quality — major issues"}
                  {form.score >= 4 &&
                    form.score <= 5 &&
                    "Below average — needs significant work"}
                  {form.score === 6 && "Average — meets minimum standards"}
                  {form.score === 7 && "Good — minor improvements needed"}
                  {form.score >= 8 &&
                    form.score <= 9 &&
                    "Very good — ready with minor changes"}
                  {form.score === 10 &&
                    "Excellent — ready for immediate publication"}
                </p>
              )}

              {formErrors.score && <p style={errorStyle}>{formErrors.score}</p>}
            </div>

            {/* Comments to Author */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Comments to Author *
                <span
                  style={{
                    fontWeight: 400,
                    color:
                      form.comments.trim().length < 50 &&
                      form.comments.length > 0
                        ? "#ef4444"
                        : "var(--color-surface-400)",
                    marginLeft: "8px",
                    fontSize: "12px",
                  }}
                >
                  {form.comments.length} characters (minimum 50)
                </span>
              </label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                placeholder="Provide detailed feedback for the author. Include specific strengths, weaknesses, and suggestions for improvement..."
                rows={8}
                className={`input-base ${formErrors.comments ? "input-error" : ""}`}
                style={{ resize: "vertical", lineHeight: 1.7 }}
              />
              {formErrors.comments && (
                <p style={errorStyle}>{formErrors.comments}</p>
              )}
            </div>

            {/* Private Notes */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>
                Confidential Notes to Editor
                <span
                  style={{
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "8px",
                    fontSize: "12px",
                  }}
                >
                  (optional — not shown to author)
                </span>
              </label>
              <textarea
                value={form.privateNotes}
                onChange={(e) =>
                  setForm({ ...form, privateNotes: e.target.value })
                }
                placeholder="Any concerns or context you want to share privately with the editor..."
                rows={4}
                className="input-base"
                style={{ resize: "vertical", lineHeight: 1.7 }}
              />
            </div>

            {/* Submit */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                paddingTop: "20px",
                borderTop: "1px solid var(--color-surface-200)",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-surface-400)",
                  fontFamily: "var(--font-sans)",
                  margin: 0,
                }}
              >
                Once submitted, your review cannot be edited.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ minWidth: "160px" }}
              >
                {isSubmitting ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(201,168,76,0.3)",
                        borderTopColor: "var(--color-accent-500)",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--color-surface-700)",
  fontFamily: "var(--font-sans)",
  marginBottom: "10px",
};

const errorStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#ef4444",
  fontFamily: "var(--font-sans)",
  marginTop: "6px",
};
