import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LayoutsListing from "./LayoutsListing";
import TemplatesListing from "./TemplatesListing";
import { cn } from "@/lib/utils";

const tabMeta = {
  themes: {
    title: "Themes",
    description: "Choose a theme by previewing colors, typography and surfaces.",
  },
  layouts: {
    title: "Layouts",
    description:
      "Choose a storefront structure for hero, categories, products and offers.",
  },
  templates: {
    title: "Templates",
    description:
      "Choose, preview and customize the storefront section order.",
  },
};

export default function Themes() {
  const [activeTab, setActiveTab] = useState("themes");
  const activeMeta = tabMeta[activeTab];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="rounded-xl border bg-white">
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{activeMeta.title}</h1>
            <p className="text-sm text-muted-foreground">
              {activeMeta.description}
            </p>
          </div>

          <TabsList className="h-10 w-full shrink-0 sm:w-auto">
            <TabsTrigger
              value="themes"
              className={cn(
                "h-8 px-5",
                activeTab === "themes" &&
                  "bg-primary text-primary-foreground shadow-md hover:text-primary-foreground",
              )}
            >
              Themes
            </TabsTrigger>
            <TabsTrigger
              value="layouts"
              className={cn(
                "h-8 px-5",
                activeTab === "layouts" &&
                  "bg-primary text-primary-foreground shadow-md hover:text-primary-foreground",
              )}
            >
              Layouts
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className={cn(
                "h-8 px-5",
                activeTab === "templates" &&
                  "bg-primary text-primary-foreground shadow-md hover:text-primary-foreground",
              )}
            >
              Templates
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-5">
          <TabsContent value="themes" className="mt-0">
            <Outlet />
          </TabsContent>

          <TabsContent value="layouts" className="mt-0">
            <LayoutsListing />
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <TemplatesListing />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
