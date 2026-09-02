"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";

export interface SidebarLinkItem {
  id?: string;
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  active?: boolean;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { open: true, setOpen: () => {}, animate: false };
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-white dark:bg-[#0D111D] border-r border-kpugi-border dark:border-white/10 w-[260px] shrink-0 z-30 transition-colors duration-300",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "68px") : "260px",
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-14 px-4 py-3 flex flex-row md:hidden items-center justify-between bg-white dark:bg-[#0D111D] border-b border-kpugi-border dark:border-white/10 w-full transition-colors duration-300"
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl bg-kpugi-paper dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <IconMenu2 className="w-5 h-5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-white dark:bg-[#0D111D] p-6 z-[100] flex flex-col justify-between overflow-y-auto",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 z-50 p-2 rounded-xl bg-kpugi-paper dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <IconX className="w-5 h-5" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: SidebarLinkItem;
  className?: string;
}) => {
  const { open, animate, setOpen } = useSidebar();

  if (link.disabled) {
    return (
      <div
        id={link.id}
        className={cn(
          "flex items-center justify-start gap-3.5 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold select-none opacity-40 cursor-not-allowed text-kpugi-slate dark:text-slate-500",
          className
        )}
      >
        <span className="shrink-0">{link.icon}</span>
        <motion.div
          animate={{
            display: animate ? (open ? "flex" : "none") : "flex",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          transition={{ duration: 0.15 }}
          className="items-center justify-between flex-1 truncate"
        >
          <span className="truncate">{link.label}</span>
          {link.badge && (
            <span className="ml-auto text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shrink-0">
              {link.badge}
            </span>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <Link
      id={link.id}
      href={link.href}
      onClick={() => {
        if (link.onClick) link.onClick();
        if (window.innerWidth < 768) setOpen(false);
      }}
      className={cn(
        "flex items-center justify-start gap-3.5 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold group/sidebar transition-colors duration-150",
        link.active
          ? "bg-kpugi-blue text-white shadow-sm shadow-kpugi-blue/25 font-bold"
          : "text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5",
        className
      )}
      {...props}
    >
      <span className={cn("shrink-0", link.active ? "text-white" : "text-kpugi-slate dark:text-slate-400 group-hover/sidebar:text-kpugi-ink dark:group-hover/sidebar:text-white")}>
        {link.icon}
      </span>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.15 }}
        className={cn(
          "text-xs group-hover/sidebar:translate-x-0.5 transition-transform duration-150 whitespace-pre inline-block !p-0 !m-0 truncate",
          link.active ? "text-white font-bold" : "text-kpugi-slate dark:text-slate-300 group-hover/sidebar:text-kpugi-ink dark:group-hover/sidebar:text-white"
        )}
      >
        {link.label}
      </motion.span>

      {link.badge && (
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          transition={{ duration: 0.15 }}
          className="ml-auto text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shrink-0"
        >
          {link.badge}
        </motion.span>
      )}
    </Link>
  );
};
