import { Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { SettingsSidebar } from "@/components/layout/SettingsSidebar";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const navigate = useNavigate();
  const closeSettings = () => navigate("/dashboard");

  return (
    <div className="relative min-h-screen bg-gray-50">
      
      {/* ❌ Top Right (EXTREME CORNER) */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed top-20 right-4 z-50 h-9 w-9 rounded-lg"
        onClick={closeSettings}
        aria-label="Close settings"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* ⬇️ Bottom Left (EXTREME CORNER) */}
      <Button
        type="button"
        variant="outline"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2"
        onClick={closeSettings}
      >
        Close
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* CENTERED CONTENT */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex min-h-0 items-start gap-6 pt-6 pb-16">
          <SettingsSidebar embedded />

          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
}