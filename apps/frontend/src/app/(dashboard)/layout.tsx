"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/hooks/useAuth";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Spinner from "@/components/ui/Spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ closed by default
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  if (!isMounted || isLoading || !isAuthenticated || !user) {
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
        <div style={{ textAlign: "center" }}>
          <Spinner size="lg" />
          <p
            style={{
              marginTop: "16px",
              fontSize: "14px",
              color: "var(--color-surface-500)",
            }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-surface-100)",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div
        style={{
          marginLeft: !isMobile && sidebarOpen ? "240px" : "0", // ✅ FIX
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        <main
          style={{
            flex: 1,
            padding: "24px",
            maxWidth: "1400px",
            width: "100%",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
