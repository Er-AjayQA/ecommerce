import { Card } from "@/components/ui/card";
import { TableListingSkelton } from "@/components/common/TableListingSkelton";
import { TableListingNoRecords } from "@/components/common/TableListingNoRecords";
import { useThemes } from "@/context/themesContext";
import { ThemePreviewCard } from "./ThemesPreviewCard";

export default function ThemesListing() {
  const { listing, listingLoading } = useThemes();

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
          {listing?.map((theme, index) => (
            <ThemePreviewCard key={theme.name || index} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}
