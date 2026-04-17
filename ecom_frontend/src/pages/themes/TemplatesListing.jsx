import { Card } from "@/components/ui/card";
import { TableListingNoRecords } from "@/components/common/TableListingNoRecords";
import { TableListingSkelton } from "@/components/common/TableListingSkelton";
import { useTemplates } from "@/context/templatesContext";
import { TemplatePreviewCard } from "./TemplatePreviewCard";

export default function TemplatesListing() {
  const { listing, listingLoading } = useTemplates();

  return (
    <div className="space-y-6">
      {listingLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <TableListingSkelton listingLength={6} columnLength={1} />
        </div>
      ) : listing.length === 0 ? (
        <Card className="p-6">
          <TableListingNoRecords span={1} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listing.map((template) => (
            <TemplatePreviewCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
