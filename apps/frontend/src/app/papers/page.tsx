"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import papersService from "@/services/papersService";
import { formatDate, truncate, getErrorMessage } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
interface Paper {
  id: string;
  title: string;
  abstract: string;
  category: string;
  journal: string;
  authors: { name: string; affiliation: string }[];
  keywords: string[];
  publishedDate: string;
  doi: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CATEGORIES = [
  "All Categories",
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

function BrowsePapersContent() {
  const searchParams = useSearchParams();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchPapers();
  }, [searchQuery, selectedCategory, currentPage]);

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      setError("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { page: currentPage, limit: 9 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== "All Categories")
        params.category = selectedCategory;
      const data = await papersService.getPublishedPapers(params);
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
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

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
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "18px" }}>🔬</span>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-accent-500)",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            Scientific Journal
          </span>
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
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
      </nav>

      {/* Page header */}
      <div
        style={{
          backgroundColor: "var(--color-primary-900)",
          padding: "48px 40px",
        }}
      >
        <div
          style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              color: "white",
              fontSize: "36px",
              margin: "0 0 12px",
            }}
          >
            Published Research
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-sans)",
              margin: "0 0 28px",
            }}
          >
            Explore peer-reviewed papers across all scientific disciplines
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div
              style={{
                display: "flex",
                gap: "0",
                maxWidth: "560px",
                margin: "0 auto",
              }}
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, abstract or keywords..."
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  border: "none",
                  borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
                  outline: "none",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  color: "var(--color-surface-800)",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "14px 24px",
                  backgroundColor: "var(--color-accent-500)",
                  color: "var(--color-primary-900)",
                  border: "none",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-accent-600)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-accent-500)";
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px",
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        {/* Sidebar filters */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-surface-200)",
            boxShadow: "var(--shadow-card)",
            padding: "20px",
            position: "sticky",
            top: "80px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary-900)",
              fontSize: "15px",
              margin: "0 0 16px",
            }}
          >
            Categories
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  color:
                    selectedCategory === cat
                      ? "var(--color-primary-900)"
                      : "var(--color-surface-600)",
                  backgroundColor:
                    selectedCategory === cat
                      ? "var(--color-primary-50)"
                      : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  borderLeft:
                    selectedCategory === cat
                      ? "3px solid var(--color-primary-900)"
                      : "3px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-surface-50)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Papers grid */}
        <div>
          {/* Results info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-surface-500)",
                fontFamily: "var(--font-sans)",
                margin: 0,
              }}
            >
              {pagination
                ? `${pagination.total} paper${pagination.total !== 1 ? "s" : ""} found`
                : ""}
              {searchQuery && (
                <span>
                  {" "}
                  for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </span>
              )}
            </p>

            {(searchQuery || selectedCategory !== "All Categories") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                  setSelectedCategory("All Categories");
                  setCurrentPage(1);
                }}
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-primary-900)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Clear filters
              </button>
            )}
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
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "60px",
              }}
            >
              <Spinner size="lg" />
            </div>
          )}

          {/* Empty */}
          {!isLoading && papers.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                backgroundColor: "white",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-surface-200)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
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
                {searchQuery
                  ? "Try different search terms."
                  : "No papers published in this category yet."}
              </p>
            </div>
          )}

          {/* Papers grid */}
          {!isLoading && papers.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "32px",
              }}
            >
              {papers.map((paper) => (
                <Link
                  key={paper.id}
                  href={`/papers/${paper.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-surface-200)",
                      padding: "20px",
                      height: "100%",
                      boxSizing: "border-box",
                      boxShadow: "var(--shadow-card)",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "var(--shadow-card-hover)";
                      e.currentTarget.style.borderColor =
                        "var(--color-primary-900)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "var(--shadow-card)";
                      e.currentTarget.style.borderColor =
                        "var(--color-surface-200)";
                    }}
                  >
                    {/* Category tag */}
                    <div style={{ marginBottom: "12px" }}>
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

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--color-primary-900)",
                        fontSize: "15px",
                        lineHeight: 1.5,
                        margin: "0 0 10px",
                        flex: 0,
                      }}
                    >
                      {truncate(paper.title, 90)}
                    </h3>

                    {/* Abstract */}
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--color-surface-500)",
                        fontFamily: "var(--font-sans)",
                        lineHeight: 1.6,
                        margin: "0 0 14px",
                        flex: 1,
                      }}
                    >
                      {truncate(paper.abstract, 130)}
                    </p>

                    {/* Keywords */}
                    {paper.keywords?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                          marginBottom: "14px",
                        }}
                      >
                        {paper.keywords.slice(0, 3).map((kw) => (
                          <span
                            key={kw}
                            style={{
                              fontSize: "11px",
                              backgroundColor: "var(--color-surface-100)",
                              color: "var(--color-surface-500)",
                              padding: "2px 8px",
                              borderRadius: "999px",
                              fontFamily: "var(--font-sans)",
                              border: "1px solid var(--color-surface-200)",
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div
                      style={{
                        borderTop: "1px solid var(--color-surface-100)",
                        paddingTop: "12px",
                        marginTop: "auto",
                      }}
                    >
                      {paper.authors?.length > 0 && (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--color-surface-500)",
                            fontFamily: "var(--font-sans)",
                            margin: "0 0 4px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
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
                        {formatDate(paper.publishedDate)}
                      </p>
                    </div>
                  </div>
                </Link>
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

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((page) => (
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
                      currentPage === page
                        ? "var(--color-primary-900)"
                        : "white",
                    color:
                      currentPage === page
                        ? "white"
                        : "var(--color-surface-600)",
                    fontSize: "13px",
                    fontFamily: "var(--font-sans)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {page}
                </button>
              ))}

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
      </div>
    </div>
  );
}

export default function BrowsePapersPage() {
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
      <BrowsePapersContent />
    </Suspense>
  );
}
