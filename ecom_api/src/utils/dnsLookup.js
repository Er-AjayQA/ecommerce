const dns = require("dns").promises;
const { normalizeDomain } = require("./tenantHelpers");

function stripHostPort(host) {
  if (!host || typeof host !== "string") return "";
  const h = host.trim();
  if (!h.includes(":")) return h;
  if (h.startsWith("[")) {
    const end = h.indexOf("]");
    if (end !== -1 && h[end + 1] === ":") return h.slice(1, end);
    return h;
  }
  const parts = h.split(":");
  if (parts.length === 2 && /^\d+$/.test(parts[1])) return parts[0];
  return h;
}

function parseStoreDomain(input) {
  let host = normalizeDomain(String(input || ""));
  host = stripHostPort(host);
  if (!host) return { apex: "", wwwHost: "" };
  let apex = host;
  if (apex.startsWith("www.")) apex = apex.slice(4);
  const wwwHost = apex ? `www.${apex}` : "";
  return { apex, wwwHost };
}

async function resolveA(hostname) {
  if (!hostname) return [];
  try {
    const values = await dns.resolve4(hostname);
    return [...new Set(values)].sort();
  } catch {
    return [];
  }
}

async function resolveWww(wwwHost) {
  if (!wwwHost) return { type: null, values: [] };
  try {
    const cnames = await dns.resolveCname(wwwHost);
    const values = [...new Set(cnames)].map((c) => String(c).replace(/\.$/, ""));
    return { type: "CNAME", values: values.sort() };
  } catch {
    const values = await resolveA(wwwHost);
    if (values.length) return { type: "A", values };
    return { type: null, values: [] };
  }
}

async function resolveTxt(hostname) {
  if (!hostname) return [];
  try {
    const chunks = await dns.resolveTxt(hostname);
    const records = chunks.map((parts) => parts.join(""));
    return [...new Set(records)];
  } catch {
    return [];
  }
}

/**
 * ONLY current DNS values (no verification logic)
 */
async function getCurrentDnsValues(rawDomain) {
  const { apex, wwwHost } = parseStoreDomain(rawDomain);

  if (!apex) {
    return {
      apex: "",
      records: {
        A: { name: "@", values: [] },
        WWW: { name: "www", type: null, values: [] },
        TXT: [],
      },
    };
  }

  const [apexA, www, txt] = await Promise.all([
    resolveA(apex),
    resolveWww(wwwHost),
    resolveTxt(apex), // ✅ CHANGED: now fetch from root domain
  ]);

  return{
  apex,
  records: {
    A: [
      {
        name: "@",
        values: apexA,
      },
    ],

    CNAME: www.type === "CNAME"
      ? [
          {
            name: "www",
            values: www.values,
          },
        ]
      : [],

    TXT: txt.map((value) => ({
      name: "@",
      value,
    })),
  },
};
}

module.exports = {
  getCurrentDnsValues,
};