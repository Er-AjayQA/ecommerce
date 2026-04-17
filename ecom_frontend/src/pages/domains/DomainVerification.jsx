import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDashed,
  HelpCircle,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDomain } from "@/context/domainContext";

function DnsRecordsTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
      <Table>
        <TableHeader className="bg-gray-100 dark:bg-gray-800/80">
          <TableRow>
            <TableHead className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Type
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current value
            </TableHead>
            <TableHead className="w-10 px-1 py-2" aria-hidden />
            <TableHead className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
              Update to
            </TableHead>
            <TableHead className="w-[88px] px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Verified
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={`${row.type}-${row.name}-${i}`}
              className={cn(
                i % 2 === 0
                  ? "bg-white dark:bg-gray-900"
                  : "bg-gray-50/80 dark:bg-gray-800/50",
              )}
            >
              <TableCell className="px-3 py-2 font-mono text-sm">{row.type}</TableCell>
              <TableCell className="px-3 py-2 font-mono text-sm">{row.name}</TableCell>
              <TableCell className="max-w-[200px] px-3 py-2 font-mono text-sm text-foreground/90">
                {row.current != null && row.current !== "" ? (
                  <span className="line-clamp-2">{row.current}</span>
                ) : (
                  <span className="italic text-muted-foreground">(empty)</span>
                )}
              </TableCell>
              <TableCell className="px-1 py-2 text-center text-muted-foreground">
                <ArrowRight className="mx-auto h-4 w-4" aria-hidden />
              </TableCell>
              <TableCell className="px-3 py-2 font-mono text-sm font-semibold text-foreground">
                {row.update}
              </TableCell>
              <TableCell className="px-3 py-2 text-center">
                {row.verified ? (
                  <span
                    className="inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400"
                    title="Verified"
                  >
                    <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                    <span className="sr-only">Verified</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center justify-center text-red-600 dark:text-red-400"
                    title="Not verified"
                  >
                    <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                    <span className="sr-only">Not verified</span>
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// function DomainConnectIllustration() {
//   return (
//     <div
//       className="relative mx-auto flex max-w-md items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white px-8 py-10 dark:border-gray-700 dark:from-gray-900 dark:to-gray-950"
//       aria-hidden
//     >
//       <div className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]">
//         <div
//           className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,#64748b_0.5px,transparent_0.5px)]"
//           style={{ backgroundSize: "24px 24px" }}
//         />
//       </div>
//       <div className="relative flex items-center gap-4 sm:gap-6">
//         <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
//           <Store className="h-8 w-8 text-blue-600" />
//         </div>
//         <div className="flex gap-1 text-muted-foreground">
//           <ArrowRight className="h-5 w-5" />
//           <ArrowRight className="-ml-3 h-5 w-5 opacity-60" />
//         </div>
//         <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
//           <Server className="h-8 w-8 text-slate-600 dark:text-slate-300" />
//         </div>
//       </div>
//     </div>
//   );
// }

export default function DomainVerification() {
  const [searchParams] = useSearchParams();
  const tenantDomainId = searchParams.get("tenant_domain_id")?.trim() || "";

  const {
    dnsLoading,
    verifyLoading,
    domainDetails,
    txtRows,
    aRows,
    cnameRows,
    fetchDnsRecords,
    verifyDnsRecords,
  } = useDomain();

  const host = domainDetails?.domain || "";

  useEffect(() => {
    if (!tenantDomainId) return;
    void fetchDnsRecords(tenantDomainId);
  }, [fetchDnsRecords, tenantDomainId]);

  return (
    <div className="mx-auto mt-2 max-w-3xl space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/settings/domains"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Domains
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
              <HelpCircle className="h-4 w-4 text-gray-500" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight">{host}</h1>
            <Badge
              className={cn(
                "cursor-default rounded-full px-3 py-1 font-medium shadow-sm",
                "bg-sky-600/90 text-white hover:bg-sky-700",
              )}
            >
              Needs setup
            </Badge>
          </div>
        </div>
      </div>

      {/* <div className="space-y-4">
        <DomainConnectIllustration />

        <div className="rounded-xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 p-[1px] shadow-sm">
          <div className="flex flex-col gap-3 rounded-[11px] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/60">
                <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </span>
              <p className="text-sm font-medium text-foreground">
                {firstName
                  ? `Hey ${firstName}, need help with your domain?`
                  : "Need help with your domain?"}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0">
              Help set up domain
            </Button>
          </div>
        </div>
      </div> */}

      <Card className="border-gray-200 shadow-sm dark:border-gray-700">
        <CardContent className="space-y-8 p-6 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600",
                dnsLoading && "border-sky-500/50",
              )}
            >
              <Loader2
                className={cn(
                  "h-4 w-4 animate-spin text-gray-500",
                  dnsLoading && "opacity-80",
                )}
              />
            </span>
            <span>
              {dnsLoading ? "Checking DNS records…" : "Checking DNS records"}
            </span>
          </div>

          {/* <section className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              1. Log in to {setup.providerName} and open DNS management for{" "}
              <span className="font-semibold">{host}</span>
            </p>
            <Card className="border-gray-200 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-900/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                    <Building2 className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{setup.providerName}</p>
                    <p className="text-xs text-muted-foreground">DNS host</p>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={setup.providerLoginUrl} target="_blank" rel="noopener noreferrer">
                    Log in
                  </a>
                </Button>
              </CardContent>
            </Card>
          </section> */}

          <section className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              1. Update this record to verify domain ownership
            </p>
            <DnsRecordsTable rows={txtRows} />
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              2. Add these new DNS records
            </p>
            <DnsRecordsTable rows={aRows} />
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              3. Update these existing records
            </p>
            <DnsRecordsTable rows={cnameRows} />
          </section>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
              disabled={!tenantDomainId || verifyLoading || dnsLoading}
              onClick={() => void verifyDnsRecords(tenantDomainId)}
            >
              {verifyLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Verifying…
                </>
              ) : (
                "I updated DNS records"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground opacity-70">
        <CircleDashed className="h-4 w-4" aria-hidden />
        <span>DNS propagation</span>
      </div>
    </div>
  );
}
