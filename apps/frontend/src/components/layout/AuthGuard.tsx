"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
}

export default function AuthGuard({
  children,
  requiredRole,
  requiredRoles,
}: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.push("/unauthorized");
      return;
    }
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, user, isLoading, router, requiredRole, requiredRoles]);

  if (isLoading || !isAuthenticated || !user) {
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

  return <>{children}</>;
}
