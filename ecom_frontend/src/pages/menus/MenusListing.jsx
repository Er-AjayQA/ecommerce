import { Outlet, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "../../components/ui/pagination";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { TableListingNoRecords } from "@/components/common/TableListingNoRecords";
import { TableListingSkelton } from "@/components/common/TableListingSkelton";
import { useMenus } from "@/context/menusContext";

export default function MenusListing() {
  const {
    listingLoading,
    paginatedData,
    totalPages,
    currentPage,
    itemsPerPage,
    search,
    searchBy,
    setSearchBy,
    setSearch,
    setCurrentPage,
    handleEditMenu,
    handleViewMenu,
    handleChangeStatus,
  } = useMenus();
  const navigate = useNavigate();

  const getBadge = (length) => {
    if (length === 0) return "bg-red-600 text-white";
    if (length > 0 && length < 20) return "bg-yellow-500 text-white";
    return "bg-green-600 text-white";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-600/90 text-white hover:bg-emerald-700";
      case "DRAFT":
        return "bg-gray-600/90 text-white hover:bg-gray-700";
      case "ARCHIVED":
        return "bg-red-600/90 text-white hover:bg-red-700";
      default:
        return "bg-gray-500/90 text-white hover:bg-gray-600";
    }
  };

  const getMenuItemsNames = (menuItem) => {
    if (menuItem.length === 0) return "-";

    let names = menuItem.map((item, idx) => {
      return item?.menu_label;
    });

    return names;
  };

  return (
    <>
      <Outlet />

      <div className="mt-2 space-y-6">
        <h1 className="text-xl font-semibold">All Menus</h1>

        {/* HEADER */}
        <div className="flex items-center justify-between">
          {/* Left: Search */}
          <div className="relative w-64">
            <Search className="absolute w-4 h-4 text-gray-400 left-3 top-2/4 -translate-y-2/4" />
            <Input
              placeholder="Search menus..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {search?.trim() !== "" && (
              <X
                className="absolute w-4 h-4 text-gray-400 cursor-pointer right-3 top-2/4 -translate-y-2/4"
                onClick={() => setSearch("")}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-56">
              <CustomSelect
                label=""
                placeholder="All Status"
                options={[
                  { label: "All", value: "ALL" },
                  { label: "Draft", value: "DRAFT" },
                  { label: "Published", value: "PUBLISHED" },
                ]}
                value={searchBy}
                onValueChange={(val) => setSearchBy(val)}
              />
            </div>

            <Button onClick={() => navigate("/menus/create")}>
              + Add Menu
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <Card>
          <Table className="min-w-full overflow-hidden border border-collapse border-gray-300 rounded-lg">
            <TableHeader className="bg-gray-200 dark:bg-gray-700">
              <TableRow>
                <TableHead className="w-[5%] px-3 py-2 text-left">
                  S.No
                </TableHead>
                <TableHead className="w-[10%] px-3 py-2 text-left">
                  Menu
                </TableHead>
                <TableHead className="w-[25%] px-3 py-2 text-center">
                  Menu Items
                </TableHead>
                <TableHead className="w-[10%] px-3 py-2 text-center">
                  Status
                </TableHead>
                <TableHead className="w-[10%] px-3 py-2 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listingLoading ? (
                <TableListingSkelton listingLength={5} columnLength={5} />
              ) : paginatedData.length === 0 ? (
                <TableListingNoRecords span={5} />
              ) : (
                paginatedData.map((m, index) => (
                  <TableRow
                    key={index}
                    className={`${
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-200 dark:bg-gray-700/40"
                    } hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors`}
                  >
                    <TableCell className="px-3 py-2">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-left">
                      {m?.name || "-"}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <Badge className={getBadge(m?.products?.length)}>
                        {getMenuItemsNames(m?.menuItems)?.join(", ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-center">
                      <Badge
                        className={`cursor-pointer px-3 py-1 rounded-full font-medium shadow-sm ${getStatusBadge(m.status)}`}
                        onClick={() => handleChangeStatus(m.menu_id, m.status)}
                      >
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 py-2 text-center">
                      <button
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded-[10px] mr-1 hover:bg-blue-600 transition"
                        onClick={() => handleViewMenu(m?.menu_id)}
                      >
                        View
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded-[10px] hover:bg-green-600 transition"
                        onClick={() => handleEditMenu(m?.menu_id)}
                      >
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* PAGINATION */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Pagination>
            <PaginationContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <PaginationItem key={pg}>
                  <PaginationLink
                    isActive={pg === currentPage}
                    onClick={() => setCurrentPage(pg)}
                  >
                    {pg}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
