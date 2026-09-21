"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "../utils";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  MegaphoneIcon,
  LayersIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { UserIcon } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  new?: boolean;
  target?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    target?: string;
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Overview",
    path: "/admin",
  },
  {
    icon: <MegaphoneIcon />,
    name: "Campaigns",
    path: "/admin/campaigns",
  },
  {
    icon: <LayersIcon />,
    name: "Submissions",
    path: "/admin/submissions",
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    path: "/admin/users",
  },
  {
    icon: <PieChartIcon />,
    name: "Scraper",
    path: "/admin/system",
  },
  {
    icon: <PageIcon />,
    name: "Audit Logs",
    path: "/admin/audit",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <UserIcon />,
    name: "Accounts",
    path: "/admin/accounts",
  },
  {
    name: "Template Tools",
    icon: <TableIcon />,
    subItems: [
      { name: "Basic Tables", path: "/admin/basic-tables", pro: false },
      { name: "Form Elements", path: "/admin/form-elements", pro: false },
      { name: "Blank Page", path: "/admin/blank" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "support" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path?: string) => {
      if (!path) return false;
      return pathname === path;
    },
    [pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "others"
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={cn(
                "group menu-item cursor-pointer w-full text-left",
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive",
                !isExpanded && !isHovered
                  ? "justify-center"
                  : "justify-start"
              )}
            >
              <span
                className={cn(
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                )}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {nav.new && (isExpanded || isHovered || isMobileOpen) && (
                <span
                  className={cn(
                    "inset-e-10 absolute ms-auto",
                    openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "menu-dropdown-badge-active"
                      : "menu-dropdown-badge-inactive",
                    "menu-dropdown-badge"
                  )}
                >
                  new
                </span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={cn(
                    "ms-auto h-5 w-5 transition-transform duration-200",
                    openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  )}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                target={nav.target}
                className={cn(
                  "group menu-item",
                  isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive",
                  !isExpanded && !isHovered
                    ? "justify-center"
                    : "justify-start"
                )}
              >
                <span
                  className={cn(
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  )}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="ms-9 mt-2 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      target={subItem.target}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="ms-auto flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`ms-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ms-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-pro-active"
                                : "menu-dropdown-badge-pro-inactive"
                            } menu-dropdown-badge-pro`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${
        !isExpanded && !isHovered ? "w-[90px] px-3" : "w-[290px] px-5"
      } ${
        !isExpanded && isHovered ? "shadow-2xl" : ""
      } ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-6 ${
          !isExpanded && !isHovered ? "justify-center" : "justify-start px-2"
        }`}
      >
        <Link href="/admin" className="flex items-center gap-2.5">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2">
              <Image
                src="/kpugi_logo.png"
                alt="KpugiAdmin"
                width={110}
                height={28}
                priority
                className="h-7 w-auto object-contain"
              />
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-display uppercase tracking-wider bg-brand-500 text-white shadow-xs">
                Admin
              </span>
            </div>
          ) : (
            <Image
              src="/kpugi_favicon.png"
              alt="Kpugi Logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8 object-contain rounded-lg"
            />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-5 text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 flex text-xs leading-5 text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>

        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
