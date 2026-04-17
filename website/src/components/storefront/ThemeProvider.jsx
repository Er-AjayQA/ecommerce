import { getThemeStyle } from "@/lib/store-design";

export function ThemeProvider({ theme, children }) {
  return (
    <div className="min-h-screen bg-background text-foreground" style={getThemeStyle(theme)}>
      {children}
    </div>
  );
}
