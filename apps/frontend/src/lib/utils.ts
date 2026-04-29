/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    const message = axiosError.response?.data?.message;
    if (Array.isArray(message)) return message[0];
    if (typeof message === "string") return message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
};

export const getRoleDashboardPath = (role: string): string => {
  const paths: Record<string, string> = {
    author: "/author/submissions",
    editor: "/editor/submissions",
    reviewer: "/reviewer/assignments",
    admin: "/admin/users",
  };
  return paths[role] || "/";
};

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
