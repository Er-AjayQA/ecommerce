/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  applyTemplateApi,
  getActiveTemplateApi,
} from "@/services/designService";
import { templates } from "@/utils/templates";

const TemplatesContext = createContext();
const LOCAL_STORAGE_KEY = "zyno_active_template";

const cloneTemplate = (template) => JSON.parse(JSON.stringify(template));

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeTemplate = (template) => {
  if (!template) return null;

  const parsedTemplateConfig = parseMaybeJson(template.template_config);
  const source =
    parsedTemplateConfig && typeof parsedTemplateConfig === "object"
      ? parsedTemplateConfig
      : template;
  const id = source.id || source.template_id || template.template_id;

  return {
    ...source,
    id,
    template_id: id,
    sections: Array.isArray(source.sections) ? source.sections : [],
  };
};

const getStoredTemplate = () => {
  try {
    const storedTemplate = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedTemplate ? JSON.parse(storedTemplate) : null;
  } catch (err) {
    console.error("Error reading stored template:", err);
    return null;
  }
};

const storeTemplate = (template) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(template));
  } catch (err) {
    console.error("Error saving template locally:", err);
  }
};

export const TemplatesProvider = ({ children }) => {
  const [listing, setListing] = useState(
    Object.values(templates).map(cloneTemplate),
  );
  const [appliedTemplate, setAppliedTemplate] = useState(getStoredTemplate());
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);

  const fetchAppliedTemplate = async () => {
    setListingLoading(true);
    try {
      const res = await getActiveTemplateApi();
      const activeTemplate = normalizeTemplate(
        res?.data?.data || getStoredTemplate(),
      );
      setAppliedTemplate(activeTemplate);
      if (activeTemplate) {
        storeTemplate(activeTemplate);
        setListing((prev) =>
          prev.map((template) =>
            template.id === activeTemplate.id ? activeTemplate : template,
          ),
        );
      }
    } catch (err) {
      const storedTemplate = normalizeTemplate(getStoredTemplate());
      if (storedTemplate) {
        setAppliedTemplate(storedTemplate);
        setListing((prev) =>
          prev.map((template) =>
            template.id === storedTemplate.id ? storedTemplate : template,
          ),
        );
      }
      console.error("Error fetching applied template:", err);
    } finally {
      setListingLoading(false);
    }
  };

  const handleApplyTemplate = async (template) => {
    const normalizedTemplate = normalizeTemplate(template);
    const templateToApply = {
      template_id: normalizedTemplate.id,
      ...cloneTemplate(normalizedTemplate),
    };

    setSelectedTemplate(templateToApply);
    setAppliedTemplate(templateToApply);
    setListing((prev) =>
      prev.map((item) => (item.id === templateToApply.id ? templateToApply : item)),
    );
    storeTemplate(templateToApply);

    try {
      await applyTemplateApi(templateToApply);
      fetchAppliedTemplate();
    } catch (err) {
      console.error("Error applying template:", err);
    }
  };

  useEffect(() => {
    fetchAppliedTemplate();
  }, []);

  const value = {
    listing,
    setListing,
    listingLoading,
    selectedTemplate,
    setSelectedTemplate,
    appliedTemplate,
    setAppliedTemplate,
    handleApplyTemplate,
  };

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
};

export const useTemplates = () => {
  const context = useContext(TemplatesContext);
  if (!context) {
    throw new Error("useTemplates must be used within a TemplatesProvider");
  }
  return context;
};
