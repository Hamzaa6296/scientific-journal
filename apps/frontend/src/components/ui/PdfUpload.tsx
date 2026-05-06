"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import uploadService from "@/services/uploadService";
import Link from "next/link";

interface PdfUploadProps {
  value: string; // current fileUrl value
  onChange: (url: string) => void; // called when upload completes
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfUpload({ value, onChange, error }: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate type
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    // Validate size — 10 MB max
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must not exceed 10 MB.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      const result = await uploadService.uploadPdf(file, (percent) => {
        setUploadProgress(percent);
      });

      onChange(result.fileUrl);
      setUploadedFile({ name: file.name, size: file.size });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setUploadError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemove = () => {
    onChange("");
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadError("");
  };

  // ── Already uploaded — show file info ──────────────────────────────────────
  if (value && !isUploading) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 20px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {/* PDF icon */}
          <div
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#dc2626",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "var(--font-sans)",
              }}
            >
              PDF
            </span>
          </div>

          {/* File info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                color: "#166534",
                margin: "0 0 2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {uploadedFile?.name || "Paper uploaded"}
            </p>
            <p
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                color: "#15803d",
                margin: 0,
              }}
            >
              {uploadedFile ? formatBytes(uploadedFile.size) : ""} · Upload
              complete ✓
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <Link
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                color: "#15803d",
                textDecoration: "none",
                padding: "5px 12px",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "white",
                transition: "all 0.15s",
              }}
            >
              Preview
            </Link>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                color: "#ef4444",
                padding: "5px 12px",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "white",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Remove
            </button>
          </div>
        </div>

        {/* Error from parent form */}
        {error && (
          <p
            style={{
              fontSize: "12px",
              color: "#ef4444",
              fontFamily: "var(--font-sans)",
              marginTop: "4px",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  // ── Upload in progress ─────────────────────────────────────────────────────
  if (isUploading) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "var(--color-surface-50)",
          border: "1px solid var(--color-surface-200)",
          borderRadius: "var(--radius-sm)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontFamily: "var(--font-sans)",
            color: "var(--color-surface-600)",
            margin: "0 0 16px",
          }}
        >
          Uploading... {uploadProgress}%
        </p>

        {/* Progress bar */}
        <div
          style={{
            height: "6px",
            backgroundColor: "var(--color-surface-200)",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${uploadProgress}%`,
              backgroundColor: "var(--color-primary-900)",
              borderRadius: "999px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    );
  }

  // ── Default drop zone ──────────────────────────────────────────────────────
  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        style={{
          padding: "36px 24px",
          border: `2px dashed ${
            isDragging
              ? "var(--color-primary-900)"
              : error
                ? "#ef4444"
                : "var(--color-surface-300)"
          }`,
          borderRadius: "var(--radius-sm)",
          backgroundColor: isDragging
            ? "var(--color-primary-50)"
            : "var(--color-surface-50)",
          cursor: "pointer",
          textAlign: "center",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = "var(--color-primary-900)";
            e.currentTarget.style.backgroundColor = "var(--color-primary-50)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = error
              ? "#ef4444"
              : "var(--color-surface-300)";
            e.currentTarget.style.backgroundColor = "var(--color-surface-50)";
          }
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            backgroundColor: "var(--color-primary-900)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <span
            style={{
              color: "var(--color-accent-500)",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "var(--font-sans)",
            }}
          >
            PDF
          </span>
        </div>

        <p
          style={{
            fontSize: "15px",
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            color: "var(--color-primary-900)",
            margin: "0 0 6px",
          }}
        >
          {isDragging ? "Drop your PDF here" : "Upload Paper PDF"}
        </p>

        <p
          style={{
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            color: "var(--color-surface-400)",
            margin: "0 0 16px",
          }}
        >
          Drag and drop your file here, or click to browse
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 20px",
            backgroundColor: "var(--color-primary-900)",
            color: "var(--color-accent-500)",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            pointerEvents: "none",
          }}
        >
          Choose File
        </div>

        <p
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-sans)",
            color: "var(--color-surface-300)",
            margin: "12px 0 0",
          }}
        >
          PDF only · Maximum 10 MB
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      {/* Upload error */}
      {uploadError && (
        <p
          style={{
            fontSize: "12px",
            color: "#ef4444",
            fontFamily: "var(--font-sans)",
            marginTop: "6px",
          }}
        >
          {uploadError}
        </p>
      )}

      {/* Form validation error */}
      {error && !uploadError && (
        <p
          style={{
            fontSize: "12px",
            color: "#ef4444",
            fontFamily: "var(--font-sans)",
            marginTop: "6px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
