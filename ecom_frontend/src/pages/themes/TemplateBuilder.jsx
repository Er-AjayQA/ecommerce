import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sectionVariants } from "@/utils/templates";
import { TemplateStorefrontPreview } from "./TemplateStorefrontPreview";

const cloneTemplate = (template) => JSON.parse(JSON.stringify(template));

const normalizeSections = (sections) =>
  [...sections].map((section, index) => ({ ...section, order: index + 1 }));

const sortSectionsByOrder = (sections) =>
  [...sections].sort((a, b) => a.order - b.order);

export const TemplateBuilder = ({ template, open, onOpenChange, onSave }) => {
  const [draft, setDraft] = useState(() => cloneTemplate(template));

  const orderedSections = useMemo(
    () => normalizeSections(sortSectionsByOrder(draft.sections || [])),
    [draft.sections],
  );

  const updateSections = (sections) => {
    setDraft((prev) => ({
      ...prev,
      sections: normalizeSections(sections),
    }));
  };

  const updateSection = (sectionId, updates) => {
    updateSections(
      orderedSections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    );
  };

  const updateSectionSettings = (sectionId, updates) => {
    updateSections(
      orderedSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              settings: {
                ...(section.settings || {}),
                ...updates,
              },
            }
          : section,
      ),
    );
  };

  const moveSection = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedSections.length) return;

    const nextSections = [...orderedSections];
    const [movedSection] = nextSections.splice(index, 1);
    nextSections.splice(nextIndex, 0, movedSection);
    updateSections(nextSections);
  };

  const handleSave = () => {
    onSave({ ...draft, sections: orderedSections });
    onOpenChange(false);
  };

  const renderSettingsControls = (section) => {
    if (section.type === "header") {
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={Boolean(section.settings?.sticky)}
              onChange={(event) =>
                updateSectionSettings(section.id, {
                  sticky: event.target.checked,
                })
              }
            />
            Sticky header
          </label>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={Boolean(section.settings?.showSearch)}
              onChange={(event) =>
                updateSectionSettings(section.id, {
                  showSearch: event.target.checked,
                })
              }
            />
            Show search
          </label>
        </div>
      );
    }

    if (section.type === "hero") {
      return (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Hero Title
          </label>
          <input
            value={section.settings?.title || ""}
            className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
            placeholder="Enter hero title"
            onChange={(event) =>
              updateSectionSettings(section.id, {
                title: event.target.value,
              })
            }
          />
        </div>
      );
    }

    if (section.type === "products") {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Product Limit
            </label>
            <input
              type="number"
              min="3"
              max="9"
              value={section.settings?.limit || 6}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
              onChange={(event) =>
                updateSectionSettings(section.id, {
                  limit: Number(event.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Product Source
            </label>
            <select
              value={section.settings?.source || "featured"}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
              onChange={(event) =>
                updateSectionSettings(section.id, {
                  source: event.target.value,
                })
              }
            >
              <option value="featured">Featured</option>
              <option value="latest">Latest</option>
              <option value="bestsellers">Best Sellers</option>
              <option value="deals">Deals</option>
            </select>
          </div>
        </div>
      );
    }

    return (
      <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        No extra settings available for this section yet.
      </p>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Customize {template.name}</DialogTitle>
          <DialogDescription>
            Enable sections, change variants and arrange the storefront order.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
          <div className="space-y-3">
            {orderedSections.map((section, index) => (
              <Card key={section.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <h3 className="text-sm font-semibold capitalize">
                        {section.type}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Section ID: {section.id}
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(event) =>
                        updateSection(section.id, {
                          enabled: event.target.checked,
                        })
                      }
                    />
                    Enabled
                  </label>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Variant
                    </label>
                    <select
                      value={section.variant}
                      className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
                      onChange={(event) =>
                        updateSection(section.id, {
                          variant: event.target.value,
                        })
                      }
                    >
                      {(sectionVariants[section.type] || []).map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-lg border bg-background p-3">
                    <p className="mb-3 text-xs font-semibold text-muted-foreground">
                      Configuration
                    </p>
                    {renderSettingsControls(section)}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveSection(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                      Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === orderedSections.length - 1}
                      onClick={() => moveSection(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                      Down
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Button type="button" className="w-full" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Customized Template
            </Button>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Eye className="h-4 w-4" />
              Live Preview
            </div>
            <TemplateStorefrontPreview template={{ ...draft, sections: orderedSections }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
