import { applyThemeApi, getActiveThemeApi } from "@/services/designService";
import { themes } from "@/utils/themes";
import { createContext, useContext, useEffect, useState } from "react";

const ThemesContext = createContext();

export const ThemesProvider = ({ children }) => {
  const [listing, setListing] = useState(Object.values(themes));
  const [appliedTheme, setAppliedTheme] = useState(Object.values(themes));

  // Fetch Applied Theme
  const fetchAppliedTheme = async () => {
    try {
      const res = await getActiveThemeApi();
      setAppliedTheme(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching applied theme:", err);
    }
  };

  const [selectedTheme, setSelectedTheme] = useState(null);

  const handleApplyTheme = async (theme) => {
    try {
      const res = await applyThemeApi(theme);
      fetchAppliedTheme();
    } catch (err) {
      console.error("Error fetching applied theme:", err);
    }
  };

  useEffect(() => {
    fetchAppliedTheme();
  }, []);

  const value = {
    listing,
    setListing,
    listingLoading: false,
    selectedTheme,
    handleApplyTheme,
    appliedTheme,
    setAppliedTheme,
  };

  return (
    <ThemesContext.Provider value={value}>{children}</ThemesContext.Provider>
  );
};

export const useThemes = () => {
  const context = useContext(ThemesContext);
  if (!context) {
    throw new Error("useThemes must be used within a ThemesProvider");
  }
  return context;
};
