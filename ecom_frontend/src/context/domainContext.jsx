import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAllDomains,
  getDnsRecords,
  verifyDnsRecords as postVerifyDnsRecords,
} from "@/services/domainService";

const DomainContext = createContext();

function safeJsonParse(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toDisplayValue(customerValues) {
  if (customerValues == null) return "";
  if (typeof customerValues !== "string") return String(customerValues);

  const parsed = safeJsonParse(customerValues);
  if (parsed == null) return customerValues;

  if (Array.isArray(parsed)) {
    return parsed
      .map((v) => {
        if (v == null) return "";
        if (typeof v === "string") return v;
        if (typeof v === "object") return v.value ?? JSON.stringify(v);
        return String(v);
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof parsed === "object") {
    return parsed.value ?? JSON.stringify(parsed);
  }

  return String(parsed);
}

function buildDnsTables(apiData) {
  const records = Array.isArray(apiData?.data) ? apiData.data : [];

  const toRow = (r) => ({
    type: r?.record_type ?? "",
    name: r?.name ?? "",
    current: toDisplayValue(r?.customer_values),
    update: r?.zyno_values ?? "",
    verified: Boolean(r?.verified),
  });

  const byType = (t) =>
    records.filter((r) => String(r?.record_type).toUpperCase() === t).map(toRow);

  const txtRows = byType("TXT");
  const aRows = byType("A");
  const cnameRows = byType("CNAME");

  const otherRows = records
    .filter((r) => {
      const t = String(r?.record_type).toUpperCase();
      return t !== "TXT" && t !== "A" && t !== "CNAME";
    })
    .map(toRow);

  return {
    domain: apiData?.domain || null,
    txtRows,
    aRows,
    cnameRows: [...cnameRows, ...otherRows],
  };
}

export const DomainProvider = ({ children }) => {
  const [listing, setListing] = useState([]);
  const [listingLoading, setListingLoading] = useState(false);

  const [dnsLoading, setDnsLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [domainDetails, setDomainDetails] = useState(null);
  const [txtRows, setTxtRows] = useState([]);
  const [aRows, setARows] = useState([]);
  const [cnameRows, setCnameRows] = useState([]);

  const fetchDomains = useCallback(async () => {
    setListingLoading(true);
    try {
      const res = await getAllDomains();
      setListing(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching domains:", err);
      toast.error(err.response?.data?.message || "Failed to fetch domains");
    } finally {
      setListingLoading(false);
    }
  }, []);

  const fetchDnsRecords = useCallback(async (tenantDomainId) => {
    if (!tenantDomainId) return;

    setDnsLoading(true);
    try {
      const res = await getDnsRecords(tenantDomainId);
      const payload = res?.data;
      const ui = buildDnsTables(payload);
      setDomainDetails(ui.domain);
      setTxtRows(ui.txtRows);
      setARows(ui.aRows);
      setCnameRows(ui.cnameRows);
    } catch (err) {
      console.error("Error fetching DNS records:", err);
      toast.error(err.response?.data?.message || "Failed to fetch DNS records");
    } finally {
      setDnsLoading(false);
    }
  }, []);

  const verifyDnsRecords = useCallback(
    async (tenantDomainId) => {
      if (!tenantDomainId) return;

      setVerifyLoading(true);
      try {
        const res = await postVerifyDnsRecords(tenantDomainId);
        const msg = res?.data?.message;
        if (msg) toast.success(msg);
        await fetchDnsRecords(tenantDomainId);
      } catch (err) {
        console.error("Error verifying DNS records:", err);
        toast.error(err.response?.data?.message || "Failed to verify DNS records");
      } finally {
        setVerifyLoading(false);
      }
    },
    [fetchDnsRecords],
  );

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const value = {
    listing,
    listingLoading,
    refreshListing: fetchDomains,

    dnsLoading,
    verifyLoading,
    domainDetails,
    txtRows,
    aRows,
    cnameRows,
    fetchDnsRecords,
    verifyDnsRecords,
  };

  return (
    <DomainContext.Provider value={value}>{children}</DomainContext.Provider>
  );
};

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error("useDomain must be used within a DomainProvider");
  }
  return context;
};
