"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { UserButton } from "@clerk/nextjs";

interface AppHeaderProps {
  profile?: {
    id: string;
    is_admin: boolean;
    role: string;
    full_name: string | null;
    email: string;
  };
}

const AppHeader: React.FC<AppHeaderProps> = ({ profile }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white xl:border-b dark:border-gray-800 dark:bg-gray-900 transition-colors">
      <div className="flex grow items-center justify-between px-4 py-3 sm:px-6">
        {/* Left Side: Toggle Button + Search Bar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          <button
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <Link href="/admin" className="xl:hidden flex items-center gap-2">
            <Image
              src="/kpugi_logo.png"
              alt="KpugiAdmin"
              width={95}
              height={24}
              className="h-6 w-auto object-contain"
            />
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-display uppercase tracking-wider bg-brand-500 text-white">
              Admin
            </span>
          </Link>

          {/* Search Input with ⌘K */}
          <div className="relative hidden xl:block w-full max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search campaigns, creators, transactions..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-transparent py-2 pl-10 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-white/3 dark:text-white dark:placeholder-gray-500"
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                ⌘ K
              </kbd>
            </span>
          </div>
        </div>

        {/* Right Side: Theme Toggle + Notifications + User Avatar */}
        <div className="flex items-center gap-3">
          <ThemeToggleButton />

          {/* Notification Button */}
          <button
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 14c.66 0 1.2.54 1.2 1.2v.3H3.8v-.3c0-.66.54-1.2 1.2-1.2V9a5 5 0 0 1 10 0v5z" />
              <path d="M8.5 16.5a1.5 1.5 0 0 0 3 0" />
            </svg>
          </button>

          {/* User Profile Area */}
          <div className="flex items-center gap-2.5 pl-2">
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold font-display text-gray-800 dark:text-white/90 truncate max-w-[140px]">
                {profile?.full_name || "Kpugi Clearance"}
              </span>
              <span className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">
                {profile?.email || "admin@kpugi.com"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
