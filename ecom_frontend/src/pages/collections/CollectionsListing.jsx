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
import { Search, Upload, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "../../components/ui/pagination";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useCollections } from "@/context/collectionsContext";
import { TableListingNoRecords } from "@/components/common/TableListingNoRecords";
import { TableListingSkelton } from "@/components/common/TableListingSkelton";

export default function CollectionsListing() {
  const {
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    listingLoading,
    itemsPerPage,
    statusOptions,
    searchBy,
    setSearchBy,
    search,
    setSearch,
    handleEditCollection,
    handleViewCollection,
    handleChangeStatus,
    handleGetAllMediaList,
    showMedia,
    setShowMedia,
    mediaList,
    setMediaList,
    mediaListLoading,
    setMediaListLoading,
  } = useCollections();
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

  return (
    <>
      <Outlet />

      <div className="mt-2 space-y-6">
        <h1 className="text-xl font-semibold">All Collections</h1>

        {/* HEADER */}
        <div className="flex items-center justify-between">
          {/* Left: Search */}
          <div className="relative w-64">
            <Search className="absolute w-4 h-4 text-gray-400 left-3 top-2/4 -translate-y-2/4" />
            <Input
              placeholder="Search collections..."
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
                options={statusOptions}
                value={searchBy}
                onValueChange={(val) => setSearchBy(val)}
              />
            </div>

            <Button onClick={() => navigate("/collections/create")}>
              + Add Collection
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
                <TableHead className="w-[16.66%] px-3 py-2 text-left">
                  Title
                </TableHead>
                <TableHead className="w-[16.66%] px-3 py-2 text-center">
                  Products
                </TableHead>
                <TableHead className="w-[16.66%] px-3 py-2 text-center">
                  Product Conditions
                </TableHead>
                <TableHead className="w-[16.66%] px-3 py-2 text-center">
                  Status
                </TableHead>

                <TableHead className="w-[16.66%] px-3 py-2 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listingLoading ? (
                <TableListingSkelton listingLength={5} columnLength={6} />
              ) : paginatedData.length === 0 ? (
                <TableListingNoRecords span={6} />
              ) : (
                paginatedData.map((c, index) => (
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
                    <TableCell className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] border bg-gray-100 flex items-center justify-center overflow-hidden">
                          {c.media?.length > 0 ? (
                            (() => {
                              const media = c.media[0];

                              const isVideo =
                                media.type === "video" ||
                                /\.(mp4|webm)$/i.test(media.url);

                              return isVideo ? (
                                <video
                                  src={media.url}
                                  className="object-cover w-full h-full cursor-pointer"
                                  onClick={() =>
                                    handleGetAllMediaList(
                                      c.collection_id,
                                      "collection",
                                    )
                                  }
                                  autoPlay={true}
                                  loop={true}
                                />
                              ) : (
                                <img
                                  src={media.url}
                                  alt={c.title}
                                  loading="lazy"
                                  className="object-cover w-full h-full cursor-pointer"
                                  onClick={() =>
                                    handleGetAllMediaList(
                                      c.collection_id,
                                      "collection",
                                    )
                                  }
                                />
                              );
                            })()
                          ) : (
                            <Upload className="w-4 h-4 text-gray-400" />
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold truncate">
                            {c.title}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-2 text-center">
                      <Badge className={getBadge(c?.products?.length)}>
                        {c?.products?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <Badge className={getBadge(c?.conditions?.length)}>
                        {c?.conditions?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-center">
                      <Badge
                        className={`cursor-pointer px-3 py-1 rounded-full font-medium shadow-sm ${getStatusBadge(c.status)}`}
                        onClick={() =>
                          handleChangeStatus(c.collection_id, c.status)
                        }
                      >
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 py-2 text-center">
                      <button
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded-[10px] mr-1 hover:bg-blue-600 transition"
                        onClick={() => handleViewCollection(c?.collection_id)}
                      >
                        View
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded-[10px] hover:bg-green-600 transition"
                        onClick={() => handleEditCollection(c?.collection_id)}
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

        {/* Media Popup */}
        <Dialog open={showMedia} onOpenChange={setShowMedia}>
          <DialogContent className="w-full max-w-6xl h-[85vh] p-0 overflow-hidden flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-3 border-b bg-white shrink-0">
              <DialogTitle>Collection Media Gallery</DialogTitle>
              <DialogDescription>
                View all media files for this collection
              </DialogDescription>
            </DialogHeader>

            {(() => {
              const [api, setApi] = useState(null);
              const [activeIndex, setActiveIndex] = useState(0);

              React.useEffect(() => {
                if (!api) return;

                const updateIndex = () => {
                  setActiveIndex(api.selectedScrollSnap());
                };

                updateIndex();
                api.on("select", updateIndex);

                return () => {
                  api.off("select", updateIndex);
                };
              }, [api]);

              return (
                <>
                  {/* Main Preview Area */}
                  <div className="relative flex-1 min-h-0 overflow-hidden bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
                    {mediaListLoading ? (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                        <p className="mt-3 text-sm text-gray-500">
                          Loading media...
                        </p>
                      </div>
                    ) : mediaList && mediaList.length > 0 ? (
                      <Carousel
                        setApi={setApi}
                        className="w-full h-full overflow-hidden"
                      >
                        <div className="flex items-stretch w-full h-full min-h-0">
                          {/* LEFT BUTTON AREA */}
                          {mediaList.length > 1 && (
                            <div className="flex items-center justify-center w-10 h-full shrink-0">
                              <CarouselPrevious className="static h-20 w-8 translate-x-0 translate-y-0 rounded-xl border bg-white/20 shadow-sm hover:bg-emerald-100 hover:text-gray-700 transition-all duration-300" />
                            </div>
                          )}

                          {/* MAIN MEDIA */}
                          <CarouselContent className="flex-1 h-full min-h-0 ml-0">
                            {mediaList.map((media, idx) => (
                              <CarouselItem
                                key={idx}
                                className="h-full min-h-0 pl-0"
                              >
                                <div className="flex items-center justify-center w-full h-full min-h-0 px-2 py-4">
                                  <div className="relative flex items-center justify-center w-full h-full min-h-0 overflow-hidden">
                                    {media.url?.match(
                                      /\.(jpg|jpeg|png|gif|avif|webp)$/i,
                                    ) ? (
                                      <img
                                        src={media.url}
                                        alt={`Media ${idx + 1}`}
                                        loading="lazy"
                                        className="block max-w-full max-h-full object-contain"
                                      />
                                    ) : media.url?.match(/\.(mp4|webm)$/i) ? (
                                      <video
                                        controls
                                        loop
                                        autoPlay
                                        className="block max-w-full max-h-full object-contain rounded-2xl bg-black"
                                      >
                                        <source src={media.url} />
                                      </video>
                                    ) : (
                                      <div className="flex items-center justify-center w-full h-full bg-gray-100">
                                        <span className="text-sm text-gray-400">
                                          Unsupported media
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>

                          {/* RIGHT BUTTON AREA */}
                          {mediaList.length > 1 && (
                            <div className="flex items-center justify-center w-10 h-full shrink-0">
                              <CarouselNext className="static h-20 w-8 translate-x-0 translate-y-0 rounded-xl border bg-white/20 shadow-sm hover:bg-emerald-100 hover:text-gray-700 transition-all duration-300" />
                            </div>
                          )}
                        </div>
                      </Carousel>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        No media files available
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {mediaList && mediaList.length > 1 && (
                    <div className="shrink-0 px-4 py-3 bg-white border-t">
                      <div className="flex gap-3 overflow-x-auto">
                        {mediaList.map((media, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setActiveIndex(idx);
                              api?.scrollTo(idx);
                            }}
                            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 bg-gray-100 ${
                              activeIndex === idx
                                ? "border-emerald-500 ring-2 ring-emerald-200 scale-[1.02]"
                                : "border-transparent hover:border-gray-300 hover:scale-[1.03]"
                            }`}
                          >
                            {media.url?.match(
                              /\.(jpg|jpeg|png|gif|avif|webp)$/i,
                            ) ? (
                              <img
                                src={media.url}
                                alt={`Thumbnail ${idx + 1}`}
                                loading="lazy"
                                className="object-cover w-full h-full"
                              />
                            ) : media.url?.match(/\.(mp4|webm)$/i) ? (
                              <video
                                autoPlay={true}
                                loop={true}
                                muted
                                playsInline
                                className="object-cover w-full h-full"
                              >
                                <source src={media.url} />
                              </video>
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-[10px] text-gray-400">
                                Unsupported
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
