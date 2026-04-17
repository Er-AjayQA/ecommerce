import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectDomainDialog } from "@/components/ui/ConnectDomainDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDomain } from "@/context/domainContext";
import { TableListingSkelton } from "@/components/common/TableListingSkelton";
import { TableListingNoRecords } from "@/components/common/TableListingNoRecords";

function getDomainStatusBadgeClass(status) {
  switch (status) {
    case "connected":
      return "bg-emerald-600/90 text-white hover:bg-emerald-700";
    case "pending":
      return "bg-sky-600/90 text-white hover:bg-sky-700";
    default:
      return "bg-gray-500/90 text-white hover:bg-gray-600";
  }
}

function getDomainStatusLabel(status) {
  if (status === "pending") return "Pending";
  if (status === "connected") return "Connected";
  return status?.charAt(0).toUpperCase() + status?.slice(1);
}

export default function DomainsListing() {
  const navigate = useNavigate();
  const { listing, listingLoading } = useDomain();
  const [connectOpen, setConnectOpen] = useState(false);

  const goToVerification = (row) => {
    const params = new URLSearchParams();
    if (row?.tenant_domain_id) params.set("tenant_domain_id", row.tenant_domain_id);
    const q = params.toString() ? `?${params.toString()}` : "";
    navigate(`/settings/domains/verify${q}`);
  };

  return (
    <div className="mt-2 space-y-6">
      <ConnectDomainDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onNext={() => {}}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Domains</h1>
        <div className="flex items-center gap-3">
          <Button type="button" onClick={() => {}}>
            Connect
          </Button>
        </div>
      </div>

      <Card>
        <Table className="min-w-full overflow-hidden border border-collapse border-gray-300 rounded-lg">
          <TableHeader className="bg-gray-200 dark:bg-gray-700">
            <TableRow>
              <TableHead className="px-3 py-2 text-left">Domain</TableHead>
              <TableHead className="px-3 py-2 text-left">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listingLoading ? (
              <TableListingSkelton listingLength={3} columnLength={2} />
            ) : listing.length === 0 ? (
              <TableListingNoRecords span={2} />
            ) : (
              listing.map((row, index) => (
                <TableRow
                  key={row.tenant_domain_id}
                  onClick={() => {
                    if (row.status === "pending") goToVerification(row);
                  }}
                  className={cn(
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-200 dark:bg-gray-700/40",
                    "hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",
                    row.status === "pending" && "cursor-pointer",
                  )}
                >
                  <TableCell className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {row.status === "connected" ? (
                        <Globe className="h-4 w-4 shrink-0 text-gray-500" />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                          <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
                        </span>
                      )}
                      <span className="text-sm font-semibold">
                        {row.domain}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <Badge
                      className={cn(
                        "cursor-pointer px-3 py-1 rounded-full font-medium shadow-sm",
                        getDomainStatusBadgeClass(row.status),
                      )}
                    >
                      {getDomainStatusLabel(row.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        <a
          href="#"
          className="underline underline-offset-4 hover:text-gray-800 dark:hover:text-gray-200"
          onClick={(e) => e.preventDefault()}
        >
          Learn more about domains
        </a>
      </p>
    </div>
  );
}
