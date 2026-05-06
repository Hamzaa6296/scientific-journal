"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import papersService from "@/services/papersService";
import { formatDate, truncate, getRoleDashboardPath } from "@/lib/utils";
import Link from "next/link";
interface Paper {
  id: string;
  title: string;
  abstract: string;
  category: string;
  authors: { name: string; affiliation: string }[];
  keywords: string[];
  publishedDate: string;
  doi: string;
  journal: string;
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchRecentPapers();
  }, []);

  const fetchRecentPapers = async () => {
    try {
      const data = await papersService.getPublishedPapers({ limit: 3 });
      setRecentPapers(data.papers);
    } catch {
      // silently fail on homepage
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-surface-100)",
      }}
    >
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🔬</span>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-accent-500)",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            Scientific Journal
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href="/papers"
            style={{
              fontSize: "14px",
              fontFamily: "var(--font-sans)",
              color: "rgba(255,255,255,0.75)",
              textDecoration: "none",
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            }}
          >
            Browse Papers
          </Link>

          {isAuthenticated && user ? (
            <Link
              href={getRoleDashboardPath(user.role)}
              className="btn-primary"
              style={{
                textDecoration: "none",
                padding: "8px 18px",
                fontSize: "13px",
              }}
            >
              Dashboard →
            </Link>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <Link
                href="/login"
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  color: "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-primary"
                style={{
                  textDecoration: "none",
                  padding: "8px 18px",
                  fontSize: "13px",
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: "var(--color-primary-900)",
          padding: "80px 40px 100px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            backgroundColor: "rgba(201,168,76,0.05)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-40px",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            backgroundColor: "rgba(201,168,76,0.04)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "999px",
              padding: "6px 16px",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontSize: "12px" }}>✨</span>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-accent-500)",
                fontWeight: 500,
                letterSpacing: "0.5px",
              }}
            >
              PEER-REVIEWED RESEARCH PLATFORM
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              color: "white",
              fontSize: "52px",
              lineHeight: 1.15,
              margin: "0 0 20px",
              fontWeight: 400,
            }}
          >
            Advancing Science,{" "}
            <span style={{ color: "var(--color-accent-500)" }}>
              One Paper at a Time
            </span>
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-sans)",
              lineHeight: 1.7,
              margin: "0 0 36px",
            }}
          >
            Submit your research, get peer-reviewed by experts, and publish in a
            trusted academic platform used by researchers worldwide.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/register"
              className="btn-primary"
              style={{
                textDecoration: "none",
                padding: "14px 28px",
                fontSize: "15px",
              }}
            >
              Submit Your Research →
            </Link>
            <Link
              href="/papers"
              style={{
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                padding: "14px 28px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
            >
              Browse Published Papers
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid var(--color-surface-200)",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "0 40px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {[
            { value: "Open Access", label: "All papers freely available" },
            { value: "Double-Blind", label: "Anonymous peer review" },
            { value: "Fast Review", label: "Decisions within 4 weeks" },
            { value: "DOI Assigned", label: "Permanent citation links" },
          ].map((stat, i) => (
            <div
              key={stat.value}
              style={{
                padding: "28px 24px",
                textAlign: "center",
                borderRight:
                  i < 3 ? "1px solid var(--color-surface-200)" : "none",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--color-primary-900)",
                  margin: "0 0 4px",
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
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 40px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              fontSize: "36px",
              margin: "0 0 12px",
            }}
          >
            How It Works
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--color-surface-500)",
              fontFamily: "var(--font-sans)",
              margin: 0,
            }}
          >
            From submission to publication in four simple steps
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
          }}
        >
          {[
            {
              step: "01",
              icon: "✍️",
              title: "Submit",
              desc: "Upload your manuscript with abstract, keywords, and cover letter.",
            },
            {
              step: "02",
              icon: "👁️",
              title: "Review",
              desc: "Expert reviewers evaluate your work through a double-blind process.",
            },
            {
              step: "03",
              icon: "✅",
              title: "Decision",
              desc: "The editor makes a decision based on reviewer recommendations.",
            },
            {
              step: "04",
              icon: "🌍",
              title: "Publish",
              desc: "Accepted papers are published open-access with a DOI.",
            },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                backgroundColor: "white",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-surface-200)",
                padding: "28px 24px",
                boxShadow: "var(--shadow-card)",
                position: "relative",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: "var(--color-surface-300)",
                  letterSpacing: "1px",
                }}
              >
                {item.step}
              </div>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>
                {item.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-primary-900)",
                  fontSize: "18px",
                  margin: "0 0 8px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-surface-500)",
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECENT PAPERS ──────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: "white",
          borderTop: "1px solid var(--color-surface-200)",
          borderBottom: "1px solid var(--color-surface-200)",
          padding: "80px 40px",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "40px",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-primary-900)",
                  fontSize: "32px",
                  margin: "0 0 8px",
                }}
              >
                Recent Publications
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--color-surface-500)",
                  fontFamily: "var(--font-sans)",
                  margin: 0,
                }}
              >
                Latest peer-reviewed research from our community
              </p>
            </div>
            <Link
              href="/papers"
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-primary-900)",
                textDecoration: "none",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              View all papers →
            </Link>
          </div>

          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "2px solid var(--color-surface-300)",
                  borderTopColor: "var(--color-primary-900)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          ) : recentPapers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                backgroundColor: "var(--color-surface-50)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-surface-200)",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📚</div>
              <p
                style={{
                  fontSize: "16px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-surface-500)",
                  margin: 0,
                }}
              >
                No published papers yet. Be the first to submit!
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {recentPapers.map((paper) => (
                <Link
                  key={paper.id}
                  href={`/papers/${paper.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--color-surface-50)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-surface-200)",
                      padding: "24px",
                      height: "100%",
                      boxSizing: "border-box",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.boxShadow =
                        "var(--shadow-card-hover)";
                      e.currentTarget.style.borderColor =
                        "var(--color-primary-900)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-surface-50)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor =
                        "var(--color-surface-200)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 600,
                          color: "var(--color-primary-900)",
                          backgroundColor: "var(--color-primary-50)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          border: "1px solid var(--color-primary-200)",
                        }}
                      >
                        {paper.category}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--color-primary-900)",
                        fontSize: "16px",
                        lineHeight: 1.5,
                        margin: "0 0 10px",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {truncate(paper.title, 80)}
                    </h3>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--color-surface-500)",
                        fontFamily: "var(--font-sans)",
                        lineHeight: 1.6,
                        margin: "0 0 16px",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {truncate(paper.abstract, 120)}
                    </p>

                    {paper.authors?.length > 0 && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--color-surface-400)",
                          fontFamily: "var(--font-sans)",
                          margin: "0 0 8px",
                        }}
                      >
                        {paper.authors.map((a) => a.name).join(", ")}
                      </p>
                    )}

                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-surface-400)",
                        fontFamily: "var(--font-sans)",
                        margin: 0,
                      }}
                    >
                      Published {formatDate(paper.publishedDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FOR RESEARCHERS ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary-900)",
                fontSize: "32px",
                margin: "0 0 12px",
              }}
            >
              Built for Every Role
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "var(--color-surface-500)",
                fontFamily: "var(--font-sans)",
                margin: 0,
              }}
            >
              A complete platform for the entire academic publishing workflow
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
            }}
          >
            {[
              {
                icon: "✍️",
                role: "Authors",
                color: "#525252",
                bg: "#f5f5f0",
                border: "#e5e5e5",
                features: [
                  "Submit manuscripts easily",
                  "Track submission status",
                  "Receive reviewer feedback",
                  "Submit revisions",
                ],
              },
              {
                icon: "🔍",
                role: "Reviewers",
                color: "#15803d",
                bg: "#f0fdf4",
                border: "#bbf7d0",
                features: [
                  "Accept or decline invitations",
                  "Read manuscripts securely",
                  "Submit detailed reviews",
                  "Track your contributions",
                ],
              },
              {
                icon: "📋",
                role: "Editors",
                color: "#1d4ed8",
                bg: "#eff6ff",
                border: "#bfdbfe",
                features: [
                  "Manage the review pipeline",
                  "Assign expert reviewers",
                  "Make publication decisions",
                  "Publish accepted papers",
                ],
              },
            ].map((item) => (
              <div
                key={item.role}
                style={{
                  backgroundColor: "white",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-surface-200)",
                  padding: "28px",
                  boxShadow: "var(--shadow-card)",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: item.bg,
                    border: `1px solid ${item.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "16px",
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-primary-900)",
                    fontSize: "18px",
                    margin: "0 0 16px",
                  }}
                >
                  {item.role}
                </h3>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {item.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        marginBottom: "10px",
                        fontSize: "14px",
                        fontFamily: "var(--font-sans)",
                        color: "var(--color-surface-600)",
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          color: item.color,
                          fontSize: "14px",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: "var(--color-primary-900)",
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              color: "white",
              fontSize: "36px",
              margin: "0 0 16px",
            }}
          >
            Ready to Publish?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-sans)",
              lineHeight: 1.7,
              margin: "0 0 32px",
            }}
          >
            Join our community of researchers and contribute to the advancement
            of science.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/register"
              className="btn-primary"
              style={{
                textDecoration: "none",
                padding: "14px 32px",
                fontSize: "15px",
              }}
            >
              Create Free Account
            </Link>
            <Link
              href="/papers"
              style={{
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                padding: "14px 32px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
            >
              Browse Papers
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "#0f0f1a",
          padding: "32px 40px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-accent-500)",
            fontSize: "16px",
            margin: "0 0 8px",
          }}
        >
          Scientific Journal
        </p>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
