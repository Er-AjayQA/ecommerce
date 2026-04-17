import { useEffect, useState } from "react";
import { Eye, Settings2 } from "lucide-react";
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
import { useTemplates } from "@/context/templatesContext";
import { TemplateBuilder } from "./TemplateBuilder";
import { TemplateStorefrontPreview } from "./TemplateStorefrontPreview";

const getEnabledCount = (template) =>
  (template.sections || []).filter((section) => section.enabled).length;

const SectionSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={[
      "relative grid h-7 w-[74px] shrink-0 grid-cols-2 overflow-hidden rounded-md border p-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
      checked
        ? "border-emerald-300 bg-emerald-50 focus-visible:ring-emerald-500"
        : "border-red-300 bg-red-50 focus-visible:ring-red-500",
    ].join(" ")}
  >
    <span
      className={[
        "absolute top-0.5 h-6 w-[34px] rounded shadow-sm transition-transform",
        checked ? "translate-x-[34px]" : "translate-x-0.5",
        checked ? "bg-emerald-600" : "bg-red-600",
      ].join(" ")}
    />
    <span
      className={[
        "relative z-10 flex items-center justify-center transition-colors",
        checked ? "text-emerald-700/60" : "text-white",
      ].join(" ")}
    >
      Off
    </span>
    <span
      className={[
        "relative z-10 flex items-center justify-center transition-colors",
        checked ? "text-white" : "text-red-700/60",
      ].join(" ")}
    >
      On
    </span>
    <span className="sr-only">{checked ? "Section on" : "Section off"}</span>
  </button>
);

export const TemplatePreviewCard = ({ template }) => {
  const [displayTemplate, setDisplayTemplate] = useState(template);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const { appliedTemplate, handleApplyTemplate } = useTemplates();
  const isApplied =
    appliedTemplate?.template_id === displayTemplate.id ||
    appliedTemplate?.id === displayTemplate.id;

  useEffect(() => {
    setDisplayTemplate(template);
  }, [template]);

  const handleSaveCustomizedTemplate = (customizedTemplate) => {
    setDisplayTemplate(customizedTemplate);
    handleApplyTemplate(customizedTemplate);
  };

  const handleSectionEnabledChange = (sectionId, enabled) => {
    const nextTemplate = {
      ...displayTemplate,
      sections: (displayTemplate.sections || []).map((section) =>
        section.id === sectionId
          ? { ...section, enabled }
          : section,
      ),
    };

    setDisplayTemplate(nextTemplate);

    if (isApplied) {
      handleApplyTemplate(nextTemplate);
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden border transition-all duration-200 hover:shadow-lg">
      <div className="flex-1 border-b bg-muted/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{displayTemplate.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {displayTemplate.description}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {getEnabledCount(displayTemplate)} sections
          </Badge>
        </div>

        <div className="mt-4 rounded-lg border bg-background p-3">
          <div className="space-y-2">
            {[...(displayTemplate.sections || [])]
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold capitalize">
                      {section.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {section.variant}
                    </p>
                  </div>
                  <SectionSwitch
                    checked={section.enabled}
                    onChange={(enabled) =>
                      handleSectionEnabledChange(section.id, enabled)
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{displayTemplate.templateType}</Badge>
          <Badge variant="outline">Default Storefront</Badge>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="whitespace-nowrap"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="whitespace-nowrap"
            onClick={() => setBuilderOpen(true)}
          >
            <Settings2 className="h-4 w-4" />
            Customize
          </Button>

          {isApplied ? (
            <Button size="sm" disabled className="whitespace-nowrap bg-green-400">
              Applied
            </Button>
          ) : (
            <Button
              size="sm"
              className="whitespace-nowrap"
              onClick={() => handleApplyTemplate(displayTemplate)}
            >
              Apply Template
            </Button>
          )}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{displayTemplate.name} Preview</DialogTitle>
            <DialogDescription>{displayTemplate.description}</DialogDescription>
          </DialogHeader>
          <TemplateStorefrontPreview template={displayTemplate} />
        </DialogContent>
      </Dialog>

      <TemplateBuilder
        key={`${displayTemplate.id}-${builderOpen ? "open" : "closed"}`}
        template={displayTemplate}
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={handleSaveCustomizedTemplate}
      />
    </Card>
  );
};
