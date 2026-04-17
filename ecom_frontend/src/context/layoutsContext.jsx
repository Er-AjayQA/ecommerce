/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { applyLayoutApi, getActiveLayoutApi } from "@/services/designService";
import { layouts } from "@/utils/layouts";

const LayoutsContext = createContext();
const LOCAL_STORAGE_KEY = "zyno_active_layout";

const getStoredLayout = () => {
  try {
    const storedLayout = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedLayout ? JSON.parse(storedLayout) : null;
  } catch (err) {
    console.error("Error reading stored layout:", err);
    return null;
  }
};

const storeLayout = (layout) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layout));
  } catch (err) {
    console.error("Error saving layout locally:", err);
  }
};

export const LayoutsProvider = ({ children }) => {
  const [listing, setListing] = useState(Object.values(layouts));
  const [appliedLayout, setAppliedLayout] = useState(getStoredLayout());
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);

  const fetchAppliedLayout = async () => {
    setListingLoading(true);
    try {
      const res = await getActiveLayoutApi();
      const activeLayout = res?.data?.data || getStoredLayout();
      setAppliedLayout(activeLayout);
      if (activeLayout) {
        storeLayout(activeLayout);
      }
    } catch (err) {
      const storedLayout = getStoredLayout();
      if (storedLayout) {
        setAppliedLayout(storedLayout);
      }
      console.error("Error fetching applied layout:", err);
    } finally {
      setListingLoading(false);
    }
  };

  const handleApplyLayout = async (layout) => {
    setSelectedLayout(layout);
    setAppliedLayout({ layout_id: layout.id, ...layout });
    storeLayout({ layout_id: layout.id, ...layout });

    try {
      await applyLayoutApi(layout);
      fetchAppliedLayout();
    } catch (err) {
      console.error("Error applying layout:", err);
    }
  };

  useEffect(() => {
    fetchAppliedLayout();
  }, []);

  const value = {
    listing,
    setListing,
    listingLoading,
    selectedLayout,
    setSelectedLayout,
    appliedLayout,
    setAppliedLayout,
    handleApplyLayout,
  };

  return (
    <LayoutsContext.Provider value={value}>{children}</LayoutsContext.Provider>
  );
};

export const useLayouts = () => {
  const context = useContext(LayoutsContext);
  if (!context) {
    throw new Error("useLayouts must be used within a LayoutsProvider");
  }
  return context;
};
