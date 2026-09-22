"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "./Pagination";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, X } from "lucide-react";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
  rawBudget: number;
}

const initialTableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    rawBudget: 3900,
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    rawBudget: 24900,
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    rawBudget: 12700,
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    rawBudget: 2800,
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    rawBudget: 4500,
    status: "Active",
  },
  {
    id: 6,
    user: {
      image: "/images/user/user-22.jpg",
      name: "Devon Lane",
      role: "UI/UX Specialist",
    },
    projectName: "Mobile App Redesign",
    team: {
      images: ["/images/user/user-17.jpg", "/images/user/user-18.jpg"],
    },
    budget: "18.2K",
    rawBudget: 18200,
    status: "Active",
  },
  {
    id: 7,
    user: {
      image: "/images/user/user-23.jpg",
      name: "Eleanor Pena",
      role: "QA Engineer",
    },
    projectName: "Automated Suite",
    team: {
      images: ["/images/user/user-20.jpg"],
    },
    budget: "8.4K",
    rawBudget: 8400,
    status: "Pending",
  },
  {
    id: 8,
    user: {
      image: "/images/user/user-24.jpg",
      name: "Cody Fisher",
      role: "DevOps Architect",
    },
    projectName: "Cloud Migration",
    team: {
      images: ["/images/user/user-21.jpg", "/images/user/user-25.jpg"],
    },
    budget: "35.0K",
    rawBudget: 35000,
    status: "Active",
  },
];

type SortField = "user" | "projectName" | "status" | "budget";
type SortDirection = "asc" | "desc";

export default function BasicTableOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("user");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortField("user");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let result = [...initialTableData];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (item) => item.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.user.name.toLowerCase().includes(q) ||
          item.user.role.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "user":
          comparison = a.user.name.localeCompare(b.user.name);
          break;
        case "projectName":
          comparison = a.projectName.localeCompare(b.projectName);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "budget":
          comparison = a.rawBudget - b.rawBudget;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const isFiltered =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    sortField !== "user" ||
    sortDirection !== "asc";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      {/* Table Toolbar: Filters, Search & Reset */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90">
              Basic Table 1
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Active projects, team members, and allocated budget overview.
            </p>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
            {["all", "Active", "Pending", "Cancel"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/80 dark:border-gray-800/60">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by user or project..."
              className="h-9 w-full rounded-lg border appearance-none ps-8 pe-8 py-1.5 text-xs shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header with Sorting */}
          <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
            <TableRow>
              <TableCell
                isHeader
                onClick={() => handleSort("user")}
                className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>User</span>
                  {sortField === "user" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                  )}
                </div>
              </TableCell>

              <TableCell
                isHeader
                onClick={() => handleSort("projectName")}
                className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Project Name</span>
                  {sortField === "projectName" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                  )}
                </div>
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Team
              </TableCell>

              <TableCell
                isHeader
                onClick={() => handleSort("status")}
                className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {sortField === "status" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                  )}
                </div>
              </TableCell>

              <TableCell
                isHeader
                onClick={() => handleSort("budget")}
                className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Budget</span>
                  {sortField === "budget" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                  No matching records found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
                        <Image
                          width={40}
                          height={40}
                          src={order.user.image}
                          alt={order.user.name}
                        />
                      </div>
                      <div>
                        <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {order.user.name}
                        </span>
                        <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                          {order.user.role}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {order.projectName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    <div className="flex -space-x-2">
                      {order.team.images.map((teamImage, index) => (
                        <div
                          key={index}
                          className="h-6 w-6 overflow-hidden rounded-full border-2 border-white dark:border-gray-900"
                        >
                          <Image
                            width={24}
                            height={24}
                            src={teamImage}
                            alt={`Team member ${index + 1}`}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        order.status === "Active"
                          ? "success"
                          : order.status === "Pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm font-mono text-gray-800 dark:text-gray-200">
                    ${order.budget}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} records
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
