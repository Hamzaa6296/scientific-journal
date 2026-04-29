interface BadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "badge-draft" },
  submitted: { label: "Submitted", className: "badge-submitted" },
  under_review: { label: "Under Review", className: "badge-under-review" },
  revision: { label: "Revision", className: "badge-revision" },
  accepted: { label: "Accepted", className: "badge-accepted" },
  rejected: { label: "Rejected", className: "badge-rejected" },
  published: { label: "Published", className: "badge-published" },
};

export default function Badge({ status }: BadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "badge-draft",
  };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
