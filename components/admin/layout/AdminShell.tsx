"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { ThemeProvider } from "../context/ThemeContext";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";

interface AdminShellProps {
  children: React.ReactNode;
  profile?: {
    id: string;
    is_admin: boolean;
    role: string;
    full_name: string | null;
    email: string;
  };
}

const LayoutContent: React.FC<{ children: React.ReactNode; profile?: AdminShellProps["profile"] }> = ({
  children,
  profile,
}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-[#090C15] text-gray-900 dark:text-white transition-colors font-sans antialiased">
      <AppSidebar />
      <Backdrop />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader profile={profile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function AdminShell({ children, profile }: AdminShellProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <LayoutContent profile={profile}>{children}</LayoutContent>
      </SidebarProvider>
    </ThemeProvider>
  );
}
