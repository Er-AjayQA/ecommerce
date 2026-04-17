import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useThemes } from "@/context/themesContext";
import { Badge } from "lucide-react";

const getFontLabel = (font) => {
  return font?.split(",")?.[0]?.replace(/['"]/g, "") || "Default";
};

export const ThemePreviewCard = ({ theme }) => {
  const { appliedTheme, handleApplyTheme } = useThemes();
  const colors = theme?.colors || {};

  return (
    <Card
      className="overflow-hidden transition-all duration-200 border hover:shadow-lg"
      style={{
        backgroundColor: `hsl(${colors.card})`,
        color: `hsl(${colors.cardForeground || colors.foreground})`,
        borderColor: `hsl(${colors.border})`,
        borderRadius: theme?.radius || "0.5rem",
        fontFamily: theme?.font || "inherit",
        boxShadow: theme?.shadows?.md,
      }}
    >
      {/* Top Preview */}
      <div
        className="p-4 border-b"
        style={{
          backgroundColor: `hsl(${colors.background})`,
          borderColor: `hsl(${colors.border})`,
          color: `hsl(${colors.foreground})`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{theme.name}</h3>
            <p className="mt-1 text-xs opacity-70">
              Font: {getFontLabel(theme.font)}
            </p>
          </div>

          <Badge
            variant="secondary"
            className="border"
            style={{
              backgroundColor: `hsl(${colors.secondary})`,
              color: `hsl(${colors.secondaryForeground})`,
              borderColor: `hsl(${colors.border})`,
            }}
          >
            Radius {theme.radius}
          </Badge>
        </div>

        {/* Fake UI Preview */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <div
              className="flex-1 h-8 rounded-md"
              style={{ backgroundColor: `hsl(${colors.primary})` }}
            />
            <div
              className="w-16 h-8 rounded-md"
              style={{ backgroundColor: `hsl(${colors.accent})` }}
            />
            <div
              className="w-12 h-8 rounded-md"
              style={{ backgroundColor: `hsl(${colors.warning})` }}
            />
          </div>

          <div
            className="p-3 space-y-2 border rounded-lg"
            style={{
              backgroundColor: `hsl(${colors.card})`,
              borderColor: `hsl(${colors.border})`,
              color: `hsl(${colors.cardForeground || colors.foreground})`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Sample Card</div>
              <div
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: `hsl(${colors.muted})`,
                  color: `hsl(${colors.mutedForeground})`,
                }}
              >
                Preview
              </div>
            </div>

            <p
              className="text-sm"
              style={{ color: `hsl(${colors.mutedForeground})` }}
            >
              This is how text, surface and accents will look in this theme.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded-md"
                style={{
                  backgroundColor: `hsl(${colors.primary})`,
                  color: `hsl(${colors.primaryForeground})`,
                }}
              >
                Primary
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded-md"
                style={{
                  backgroundColor: `hsl(${colors.secondary})`,
                  color: `hsl(${colors.secondaryForeground})`,
                }}
              >
                Secondary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Meta */}
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <div
            className="border rounded-full w-7 h-7"
            title="Primary"
            style={{
              backgroundColor: `hsl(${colors.primary})`,
              borderColor: `hsl(${colors.border})`,
            }}
          />
          <div
            className="border rounded-full w-7 h-7"
            title="Secondary"
            style={{
              backgroundColor: `hsl(${colors.secondary})`,
              borderColor: `hsl(${colors.border})`,
            }}
          />
          <div
            className="border rounded-full w-7 h-7"
            title="Accent"
            style={{
              backgroundColor: `hsl(${colors.accent})`,
              borderColor: `hsl(${colors.border})`,
            }}
          />
          <div
            className="border rounded-full w-7 h-7"
            title="Muted"
            style={{
              backgroundColor: `hsl(${colors.muted})`,
              borderColor: `hsl(${colors.border})`,
            }}
          />
          <div
            className="border rounded-full w-7 h-7"
            title="Background"
            style={{
              backgroundColor: `hsl(${colors.background})`,
              borderColor: `hsl(${colors.border})`,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs opacity-70">
            {getFontLabel(theme.font)} • {theme.radius}
          </p>

          {appliedTheme?.theme_id === theme?.id ? (
            <Button size="sm" disabled className="bg-green-400">
              Applied
            </Button>
          ) : (
            <Button size="sm" onClick={() => handleApplyTheme(theme)}>
              Apply Theme
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
