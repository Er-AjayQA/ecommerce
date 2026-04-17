"use strict";

const db = require("../../../../indexRoutes/index");
const { getCurrentDnsValues } = require("../../../../utils/dnsLookup");
const TenantDomain = db.TenantDomain;
const TenantDomainDnsRecord = db.TenantDomainDnsRecord;

function parseCustomerValues(raw) {
  if (raw == null || raw === "") return raw;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function normalizeDnsTarget(value) {
  if (value == null) return "";
  return String(value).trim().toLowerCase().replace(/\.$/, "");
}

function verifyZynoInCustomerArray(recordType, zynoRaw, customerArray) {
  const zyno = zynoRaw != null ? String(zynoRaw).trim() : "";
  if (!zyno || !Array.isArray(customerArray)) return false;

  if (recordType === "A") {
    return customerArray.some((v) => String(v).trim() === zyno);
  }

  if (recordType === "CNAME") {
    const want = normalizeDnsTarget(zyno);
    return customerArray.some((v) => normalizeDnsTarget(v) === want);
  }

  if (recordType === "TXT") {
    return customerArray.some((txt) => {
      const t = String(txt).trim();
      return t === zyno || t.includes(zyno);
    });
  }

  return false;
}

function buildLiveCustomerValuesFromDns(currentDns) {
  const aCustomerValues =
    (currentDns.records &&
      currentDns.records.A &&
      currentDns.records.A[0] &&
      currentDns.records.A[0].values) ||
    [];
  const cnameCustomerValues =
    (currentDns.records &&
      currentDns.records.CNAME &&
      currentDns.records.CNAME[0] &&
      currentDns.records.CNAME[0].values) ||
    [];
  const txtRecords = (currentDns.records && currentDns.records.TXT) || [];
  const txtCustomerValues = txtRecords
    .map((r) => (r && r.value != null ? String(r.value).trim() : ""))
    .filter(Boolean);

  return {
    A: aCustomerValues,
    CNAME: cnameCustomerValues,
    TXT: txtCustomerValues,
  };
}

//////////////////// GET ALL DOMAINS ////////////////////

exports.get_All_Domains = async (req, res) => {
  try {
    const domains = await TenantDomain.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Domains fetched successfully",
      data: domains,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      success: false,
      code: 500,
      message: "Internal Server Error",
    });
  }
};

//////////////////// GET DNS RECORDS BY DOMAIN ID ////////////////////

exports.get_Dns_Records_By_Domain_Id = async (req, res) => {
  try {
    const { tenant_domain_id } = req.params;

    if (!tenant_domain_id) {
      return res.status(400).send({
        success: false,
        code: 400,
        message: "tenant_domain_id is required",
      });
    }

    const domain = await TenantDomain.findByPk(tenant_domain_id, {
      attributes: ["tenant_domain_id", "domain", "status"],
    });

    if (!domain) {
      return res.status(404).send({
        success: false,
        code: 404,
        message: "Domain not found",
      });
    }

    const dnsRecords = await TenantDomainDnsRecord.findAll({
      where: { tenant_domain_id },
      order: [["createdAt", "DESC"]],
    });

    const data = dnsRecords.map((row) => {
      const plain = row.get({ plain: true });
      return {
        ...plain,
        customer_values: parseCustomerValues(plain.customer_values),
      };
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "DNS records fetched successfully",
      domain,
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      success: false,
      code: 500,
      message: "Internal Server Error",
    });
  }
};

//////////////////// VERIFY DNS (write live DNS, then verify zyno vs customer_values read from DB) ////////////////////

exports.verify_Dns_Records = async (req, res) => {
  try {
    const { tenant_domain_id } = req.params;

    if (!tenant_domain_id) {
      return res.status(400).send({
        success: false,
        code: 400,
        message: "tenant_domain_id is required",
      });
    }

    const domain = await TenantDomain.findByPk(tenant_domain_id, {
      attributes: ["tenant_domain_id", "domain", "status"],
    });

    if (!domain) {
      return res.status(404).send({
        success: false,
        code: 404,
        message: "Domain not found",
      });
    }

    const rows = await TenantDomainDnsRecord.findAll({
      where: { tenant_domain_id },
    });

    const byType = new Map();
    for (const row of rows) {
      const plain = row.get({ plain: true });
      byType.set(plain.record_type, plain);
    }

    const need = ["A", "CNAME", "TXT"];
    const missing = need.filter((t) => !byType.has(t));
    if (missing.length) {
      return res.status(404).send({
        success: false,
        code: 404,
        message: `Missing DNS record rows for: ${missing.join(", ")}`,
      });
    }

    const currentDns = await getCurrentDnsValues(domain.domain);
    const live = buildLiveCustomerValuesFromDns(currentDns);
    const now = new Date();

    const updates = [
      {
        record_type: "A",
        name: "@",
        customerArray: live.A,
      },
      {
        record_type: "CNAME",
        name: "www",
        customerArray: live.CNAME,
      },
      {
        record_type: "TXT",
        name: "@",
        customerArray: live.TXT,
      },
    ];

    // 1) Persist live DNS snapshot; clear verified until we validate from stored rows
    for (const u of updates) {
      await TenantDomainDnsRecord.update(
        {
          customer_values: JSON.stringify(u.customerArray),
          verified: false,
          updatedAt: now,
        },
        {
          where: {
            tenant_domain_id,
            record_type: u.record_type,
            name: u.name,
          },
        },
      );
    }

    const reloaded = await TenantDomainDnsRecord.findAll({
      where: { tenant_domain_id },
    });

    const freshByType = new Map();
    for (const row of reloaded) {
      const plain = row.get({ plain: true });
      freshByType.set(plain.record_type, plain);
    }

    // 2) Verify zyno_values against customer_values as read back from the table
    const verifiedAt = new Date();
    for (const u of updates) {
      const rec = freshByType.get(u.record_type);
      const parsed = parseCustomerValues(rec.customer_values);
      const verified = verifyZynoInCustomerArray(
        u.record_type,
        rec.zyno_values,
        parsed,
      );

      await TenantDomainDnsRecord.update(
        { verified, updatedAt: verifiedAt },
        {
          where: {
            tenant_domain_id,
            record_type: u.record_type,
            name: u.name,
          },
        },
      );
    }

    const dnsRecords = await TenantDomainDnsRecord.findAll({
      where: { tenant_domain_id },
      order: [["createdAt", "DESC"]],
    });

    const data = dnsRecords.map((row) => {
      const plain = row.get({ plain: true });
      return {
        ...plain,
        customer_values: parseCustomerValues(plain.customer_values),
      };
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message:
        "Live DNS written to customer_values; verified from stored rows vs zyno_values",
      domain,
      liveDns: {
        apex: currentDns.apex,
        records: currentDns.records,
      },
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      success: false,
      code: 500,
      message: "Internal Server Error",
    });
  }
};
