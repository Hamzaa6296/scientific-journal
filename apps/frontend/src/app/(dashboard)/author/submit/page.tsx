"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import papersService from "@/services/papersService";
import { getErrorMessage } from "@/lib/utils";

const CATEGORIES = [
  "Computer Science",
  "Physics",
  "Biology",
  "Chemistry",
  "Mathematics",
  "Medicine",
  "Engineering",
  "Environmental Science",
  "Economics",
  "Psychology",
  "Social Sciences",
  "Other",
];

function SubmitPaperContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const [form, setForm] = useState({
    title: "",
    abstract: "",
    keywords: [] as string[],
    category: "",
    journal: "",
    coverLetter: "",
    fileUrl: "",
  });

  const [formErrors, setFormErrors] = useState({
    title: "",
    abstract: "",
    keywords: "",
    category: "",
    fileUrl: "",
  });

  const loadPaper = async (id: string) => {
    try {
      setIsFetching(true);
      const paper = await papersService.getPaperById(id);
      setForm({
        title: paper.title || "",
        abstract: paper.abstract || "",
        keywords: paper.keywords || [],
        category: paper.category || "",
        journal: paper.journal || "",
        coverLetter: paper.coverLetter || "",
        fileUrl: paper.fileUrl || "",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  };

  // Load existing paper if editing
  useEffect(() => {
    const load = async () => {
      if (editId) {
        await loadPaper(editId);
      }
    };
    load();
  }, [editId]);

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !form.keywords.includes(kw) && form.keywords.length < 10) {
      setForm({ ...form, keywords: [...form.keywords, kw] });
      setKeywordInput("");
      setFormErrors({ ...formErrors, keywords: "" });
    }
  };

  const removeKeyword = (kw: string) => {
    setForm({ ...form, keywords: form.keywords.filter((k) => k !== kw) });
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const validate = (): boolean => {
    const errors = {
      title: "",
      abstract: "",
      keywords: "",
      category: "",
      fileUrl: "",
    };
    let valid = true;

    if (!form.title.trim()) {
      errors.title = "Title is required";
      valid = false;
    } else if (form.title.trim().length < 10) {
      errors.title = "Title must be at least 10 characters";
      valid = false;
    }

    if (!form.abstract.trim()) {
      errors.abstract = "Abstract is required";
      valid = false;
    } else if (form.abstract.trim().length < 100) {
      errors.abstract = `Abstract must be at least 100 characters (currently ${form.abstract.trim().length})`;
      valid = false;
    }

    if (form.keywords.length === 0) {
      errors.keywords = "Add at least one keyword";
      valid = false;
    }

    if (!form.category) {
      errors.category = "Category is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      setFormErrors({
        ...formErrors,
        title: "Title is required to save draft",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (editId) {
        await papersService.updatePaper(editId, {
          ...form,
          authors: [
            {
              userId: user!.id,
              name: user!.name || user!.email,
              affiliation: user!.affiliation || "",
            },
          ],
        });
        setSuccess("Draft saved successfully.");
      } else {
        const paper = await papersService.createPaper({
          ...form,
          authors: [
            {
              userId: user!.id,
              name: user!.name || user!.email,
              affiliation: user!.affiliation || "",
            },
          ],
        });
        setSuccess("Draft saved. Redirecting...");
        setTimeout(() => router.push(`/author/submit?edit=${paper.id}`), 1500);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setActiveStep(0);
      return;
    }
    if (!form.fileUrl) {
      setFormErrors({
        ...formErrors,
        fileUrl: "Please provide a PDF URL before submitting",
      });
      setActiveStep(2);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let paperId = editId;

      if (paperId) {
        await papersService.updatePaper(paperId, {
          ...form,
          authors: [
            {
              userId: user!.id,
              name: user!.name || user!.email,
              affiliation: user!.affiliation || "",
            },
          ],
        });
      } else {
        const paper = await papersService.createPaper({
          ...form,
          authors: [
            {
              userId: user!.id,
              name: user!.name || user!.email,
              affiliation: user!.affiliation || "",
            },
          ],
        });
        paperId = paper.id;
      }

      await papersService.submitPaper(paperId!);
      setSuccess(
        "Paper submitted successfully! Redirecting to your submissions...",
      );
      setTimeout(() => router.push("/author/submissions"), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ["Basic Info", "Content", "Files & Submit"];

  if (isFetching) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px" }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <a
            href="/author/submissions"
            style={{
              fontSize: "13px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              textDecoration: "none",
            }}
          >
            ← My Submissions
          </a>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary-900)",
            fontSize: "28px",
            margin: 0,
          }}
        >
          {editId ? "Edit Paper" : "Submit New Paper"}
        </h2>
        <p
          style={{
            color: "var(--color-surface-500)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            marginTop: "4px",
          }}
        >
          Fill in all required fields. You can save as draft at any time.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "0", marginBottom: "28px" }}>
        {steps.map((step, index) => (
          <div
            key={step}
            onClick={() => setActiveStep(index)}
            style={{
              flex: 1,
              padding: "12px 16px",
              textAlign: "center",
              cursor: "pointer",
              borderBottom: `3px solid ${activeStep === index ? "var(--color-primary-900)" : "var(--color-surface-200)"}`,
              transition: "all 0.2s",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor:
                  activeStep === index
                    ? "var(--color-primary-900)"
                    : "var(--color-surface-200)",
                color:
                  activeStep === index ? "white" : "var(--color-surface-500)",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "var(--font-sans)",
                marginRight: "8px",
              }}
            >
              {index + 1}
            </span>
            <span
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
                fontWeight: activeStep === index ? 600 : 400,
                color:
                  activeStep === index
                    ? "var(--color-primary-900)"
                    : "var(--color-surface-500)",
              }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Messages */}
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
      {success && (
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
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ─── STEP 0: Basic Info ─────────────────────────────── */}
        {activeStep === 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-200)",
              padding: "28px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                marginBottom: "24px",
                fontSize: "18px",
              }}
            >
              Basic Information
            </h3>

            {/* Title */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Paper Title *
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "8px",
                  }}
                >
                  {form.title.length}/300
                </span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter the full title of your research paper"
                maxLength={300}
                className={`input-base ${formErrors.title ? "input-error" : ""}`}
              />
              {formErrors.title && <p style={errorStyle}>{formErrors.title}</p>}
            </div>

            {/* Category */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Research Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`input-base ${formErrors.category ? "input-error" : ""}`}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p style={errorStyle}>{formErrors.category}</p>
              )}
            </div>

            {/* Journal */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Target Journal
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "8px",
                  }}
                >
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={form.journal}
                onChange={(e) => setForm({ ...form, journal: e.target.value })}
                placeholder="e.g. Journal of Artificial Intelligence Research"
                className="input-base"
              />
            </div>

            {/* Keywords */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Keywords *
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "8px",
                  }}
                >
                  {form.keywords.length}/10 — Press Enter or comma to add
                </span>
              </label>
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "10px" }}
              >
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder="Type a keyword and press Enter"
                  className="input-base"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="btn-secondary"
                  style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
                >
                  Add
                </button>
              </div>
              {form.keywords.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {form.keywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "var(--color-primary-50)",
                        color: "var(--color-primary-900)",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontFamily: "var(--font-sans)",
                        border: "1px solid var(--color-primary-200)",
                      }}
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "var(--color-primary-900)",
                          padding: "0",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {formErrors.keywords && (
                <p style={errorStyle}>{formErrors.keywords}</p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="btn-secondary"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="btn-primary"
              >
                Next: Content →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 1: Content ────────────────────────────────── */}
        {activeStep === 1 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-200)",
              padding: "28px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                marginBottom: "24px",
                fontSize: "18px",
              }}
            >
              Paper Content
            </h3>

            {/* Abstract */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Abstract *
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    marginLeft: "8px",
                    color:
                      form.abstract.length < 100
                        ? "#ef4444"
                        : "var(--color-surface-400)",
                  }}
                >
                  {form.abstract.length}/5000 (minimum 100)
                </span>
              </label>
              <textarea
                value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
                placeholder="Provide a comprehensive summary of your research, including objectives, methods, results, and conclusions..."
                rows={8}
                maxLength={5000}
                className={`input-base ${formErrors.abstract ? "input-error" : ""}`}
                style={{ resize: "vertical", lineHeight: 1.7 }}
              />
              {formErrors.abstract && (
                <p style={errorStyle}>{formErrors.abstract}</p>
              )}
            </div>

            {/* Cover Letter */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                Cover Letter
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "var(--color-surface-400)",
                    marginLeft: "8px",
                  }}
                >
                  (optional)
                </span>
              </label>
              <textarea
                value={form.coverLetter}
                onChange={(e) =>
                  setForm({ ...form, coverLetter: e.target.value })
                }
                placeholder="Write a brief note to the editor explaining why your paper is a good fit for the journal..."
                rows={5}
                maxLength={2000}
                className="input-base"
                style={{ resize: "vertical", lineHeight: 1.7 }}
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-surface-400)",
                  fontFamily: "var(--font-sans)",
                  marginTop: "4px",
                }}
              >
                {form.coverLetter.length}/2000 characters
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveStep(0)}
                className="btn-secondary"
              >
                ← Back
              </button>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="btn-secondary"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="btn-primary"
                >
                  Next: Files →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Files & Submit ─────────────────────────── */}
        {activeStep === 2 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-200)",
              padding: "28px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                marginBottom: "8px",
                fontSize: "18px",
              }}
            >
              Paper File
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-surface-500)",
                fontFamily: "var(--font-sans)",
                marginBottom: "24px",
              }}
            >
              Provide a publicly accessible URL to your paper PDF. In
              production, use a file upload service like Cloudinary or AWS S3.
            </p>

            {/* File URL */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Paper PDF URL *</label>
              <input
                type="url"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                placeholder="https://example.com/your-paper.pdf"
                className={`input-base ${formErrors.fileUrl ? "input-error" : ""}`}
              />
              {formErrors.fileUrl && (
                <p style={errorStyle}>{formErrors.fileUrl}</p>
              )}
              {form.fileUrl && (
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#22c55e",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    ✓ File URL provided
                  </span>
                  <a
                    href={form.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "13px",
                      color: "var(--color-primary-900)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Preview ↗
                  </a>
                </div>
              )}
            </div>

            {/* Summary */}
            <div
              style={{
                backgroundColor: "var(--color-surface-100)",
                borderRadius: "var(--radius-sm)",
                padding: "16px 20px",
                marginBottom: "24px",
                border: "1px solid var(--color-surface-200)",
              }}
            >
              <h4
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-surface-700)",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Submission Summary
              </h4>
              {[
                { label: "Title", value: form.title || "—", ok: !!form.title },
                {
                  label: "Category",
                  value: form.category || "—",
                  ok: !!form.category,
                },
                {
                  label: "Abstract",
                  value:
                    form.abstract.length >= 100
                      ? `${form.abstract.length} characters`
                      : `${form.abstract.length} chars (need 100+)`,
                  ok: form.abstract.length >= 100,
                },
                {
                  label: "Keywords",
                  value:
                    form.keywords.length > 0 ? form.keywords.join(", ") : "—",
                  ok: form.keywords.length > 0,
                },
                {
                  label: "File",
                  value: form.fileUrl ? "Provided" : "Not provided",
                  ok: !!form.fileUrl,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--color-surface-500)",
                      fontFamily: "var(--font-sans)",
                      minWidth: "80px",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: item.ok ? "var(--color-surface-800)" : "#ef4444",
                      fontFamily: "var(--font-sans)",
                      textAlign: "right",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "300px",
                    }}
                  >
                    {item.ok ? "" : "⚠ "}
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="btn-secondary"
              >
                ← Back
              </button>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="btn-secondary"
                >
                  {isLoading ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader /> Submitting...
                    </>
                  ) : (
                    "🚀 Submit for Review"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default function SubmitPaperPage() {
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
      <SubmitPaperContent />
    </Suspense>
  );
}

function Loader() {
  return (
    <span
      style={{
        width: "16px",
        height: "16px",
        border: "2px solid rgba(201,168,76,0.3)",
        borderTopColor: "var(--color-accent-500)",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
        marginRight: "8px",
      }}
    />
  );
}

import Spinner from "@/components/ui/Spinner";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-surface-700)",
  fontFamily: "var(--font-sans)",
  marginBottom: "6px",
};

const errorStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#ef4444",
  fontFamily: "var(--font-sans)",
  marginTop: "4px",
};
