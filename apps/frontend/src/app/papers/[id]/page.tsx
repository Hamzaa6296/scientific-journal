/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import papersService from "@/services/papersService";
import { formatDate, getErrorMessage } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

export default function PublicPaperDetailPage() {
  const params = useParams();
  const paperId = params.id as string;

  const [paper, setPaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchPaper();
  }, [paperId]);

  const fetchPaper = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await papersService.getPublishedPapers({ limit: 100 });
      const found = data.papers.find((p: any) => p.id === paperId);
      if (found) {
        setPaper(found);
      } else {
        setError("Paper not found or not yet published.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-surface-100)",
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--color-surface-100)",
        }}
      >
        <nav
          style={{
            backgroundColor: "var(--color-primary-900)",
            padding: "0 40px",
            height: "64px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-accent-500)",
              fontSize: "17px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            🔬 Scientific Journal
          </Link>
        </nav>
        <div
          style={{
            maxWidth: "600px",
            margin: "80px auto",
            textAlign: "center",
            padding: "0 40px",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>📄</div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              margin: "0 0 12px",
            }}
          >
            Paper Not Found
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              margin: "0 0 24px",
            }}
          >
            {error ||
              "This paper does not exist or has not been published yet."}
          </p>
          <Link
            href="/papers"
            className="btn-primary"
            style={{ textDecoration: "none" }}
          >
            Browse Published Papers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-surface-100)",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          backgroundColor: "var(--color-primary-900)",
          padding: "0 40px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-accent-500)",
            fontSize: "17px",
            textDecoration: "none",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🔬 Scientific Journal
        </Link>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/papers"
            style={{
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              color: "rgba(255,255,255,0.75)",
              textDecoration: "none",
              padding: "8px 14px",
            }}
          >
            ← All Papers
          </Link>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              textDecoration: "none",
              padding: "8px 18px",
              fontSize: "13px",
            }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "48px 40px",
        }}
      >
        {/* Published badge */}
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: "999px",
              backgroundColor: "#eef2ff",
              color: "#4338ca",
              border: "1px solid #c7d2fe",
            }}
          >
            ✓ Published
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary-900)",
            fontSize: "34px",
            lineHeight: 1.3,
            margin: "0 0 24px",
            fontWeight: 400,
          }}
        >
          {paper.title}
        </h1>

        {/* Authors */}
        {paper.authors?.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "16px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-surface-700)",
                margin: "0 0 4px",
              }}
            >
              {paper.authors.map((a: any) => a.name).join(", ")}
            </p>
            {paper.authors[0]?.affiliation && (
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-surface-400)",
                  margin: 0,
                }}
              >
                {paper.authors[0].affiliation}
              </p>
            )}
          </div>
        )}

        {/* Meta info */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
            paddingBottom: "24px",
            borderBottom: "1px solid var(--color-surface-200)",
          }}
        >
          {[
            { label: "Category", value: paper.category },
            { label: "Journal", value: paper.journal || null },
            { label: "Published", value: formatDate(paper.publishedDate) },
            { label: "DOI", value: paper.doi || null },
          ]
            .filter((item) => item.value)
            .map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
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
                    color: "var(--color-surface-700)",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
        </div>

        {/* Main content card */}
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
          {/* Abstract */}
          <div
            style={{
              padding: "28px",
              borderBottom: "1px solid var(--color-surface-200)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                fontSize: "18px",
                margin: "0 0 14px",
              }}
            >
              Abstract
            </h2>
            <p
              style={{
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-surface-700)",
                lineHeight: 1.9,
                margin: 0,
              }}
            >
              {paper.abstract}
            </p>
          </div>

          {/* Keywords */}
          {paper.keywords?.length > 0 && (
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--color-surface-200)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--color-surface-400)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: "0 0 10px",
                }}
              >
                Keywords
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {paper.keywords.map((kw: string) => (
                  <Link
                    key={kw}
                    href={`/papers?q=${encodeURIComponent(kw)}`}
                    style={{
                      fontSize: "13px",
                      backgroundColor: "var(--color-surface-100)",
                      color: "var(--color-primary-900)",
                      padding: "5px 14px",
                      borderRadius: "999px",
                      fontFamily: "var(--font-sans)",
                      border: "1px solid var(--color-surface-200)",
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-primary-50)";
                      e.currentTarget.style.borderColor =
                        "var(--color-primary-200)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-surface-100)";
                      e.currentTarget.style.borderColor =
                        "var(--color-surface-200)";
                    }}
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Access the paper */}
          <div style={{ padding: "20px 28px" }}>
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--color-surface-400)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: "0 0 12px",
              }}
            >
              Full Text
            </h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {paper.fileUrl ? (
                <Link
                  href={paper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    padding: "10px 20px",
                  }}
                >
                  📄 Download PDF
                </Link>
              ) : (
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--color-surface-400)",
                    fontFamily: "var(--font-sans)",
                    margin: 0,
                  }}
                >
                  Full text not available online.
                </p>
              )}
              {paper.doi && (
                <Link
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    padding: "10px 20px",
                  }}
                >
                  🔗 View DOI
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Citation */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-surface-200)",
            boxShadow: "var(--shadow-card)",
            padding: "24px 28px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              fontSize: "16px",
              margin: "0 0 12px",
            }}
          >
            Cite This Paper
          </h3>
          <div
            style={{
              backgroundColor: "var(--color-surface-50)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
              border: "1px solid var(--color-surface-200)",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              color: "var(--color-surface-700)",
              lineHeight: 1.7,
              wordBreak: "break-word",
            }}
          >
            {paper.authors?.map((a: any) => a.name).join(", ") || "Unknown"} (
            {new Date(paper.publishedDate).getFullYear()}).{" "}
            <em>{paper.title}</em>. {paper.journal ? `${paper.journal}. ` : ""}
            {paper.doi ? `https://doi.org/${paper.doi}` : ""}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            backgroundColor: "var(--color-primary-900)",
            borderRadius: "var(--radius-md)",
            padding: "28px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "white",
              fontSize: "18px",
              margin: "0 0 8px",
            }}
          >
            Want to publish your research?
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-sans)",
              margin: "0 0 20px",
            }}
          >
            Join our community and submit your work for peer review.
          </p>
          <Link
            href="/register"
            className="btn-primary"
            style={{ textDecoration: "none", padding: "10px 24px" }}
          >
            Submit Your Research →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#0f0f1a",
          padding: "24px 40px",
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-sans)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} Scientific Journal. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
