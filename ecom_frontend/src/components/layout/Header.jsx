import {
  Bell,
  Search,
  User,
  LogOut,
  X,
  Menu,
  FileText,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import DarkModeToggle from "../common/DarkModeToggle";

export function Header({
  sidebarWidth,
  sidebarSide = "left",
  onToggleSidebar,
  showSidebarToggle = true,
}) {
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [expandSearch, setExpandSearch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        expandSearch &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setExpandSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandSearch]);

  const [notifications] = useState([
    { id: 1, text: "New order received", type: "report", time: "2 mins" },
    { id: 2, text: "Product stock low", type: "email", time: "12 hours" },
    { id: 3, text: "New message from John", type: "message", time: "2 days" },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case "report":
        return <FileText className="w-4 h-4 text-gray-500" />;
      case "email":
        return <Mail className="w-4 h-4 text-gray-500" />;
      case "message":
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <header
      className="fixed top-0 z-20 flex items-center h-16 px-4 transition-all duration-500 border-b bg-card border-border"
      style={{
        left: sidebarSide === "right" ? 0 : sidebarWidth,
        right: sidebarSide === "right" ? sidebarWidth : 0,
        width: `calc(100% - ${sidebarWidth}px)`,
      }}
    >
      {/* Sidebar Toggle */}
      {showSidebarToggle && (
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80"
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {expandSearch && (
        <div
          ref={searchRef}
          className="absolute top-0 left-0 flex items-center w-full h-full gap-3 px-6 bg-card"
        >
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search..."
              className="pl-12 text-base h-11 rounded-[30px]"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpandSearch(false)}
            className="w-10 h-10 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Right Icons */}
      {!expandSearch && (
        <div className="relative flex items-center gap-3 ml-auto">
          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="rounded-full h-11 w-11 bg-secondary hover:bg-secondary/80"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>

          {/* Dark Mode */}
          {/* <DarkModeToggle /> */}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full h-11 w-11 bg-secondary hover:bg-secondary/80"
              >
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                  {notifications.length}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="font-medium text-center">
                {notifications.length} Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notifications.map((note, index) => (
                <DropdownMenuItem
                  key={note.id + index}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="w-5 text-center">{getIcon(note.type)}</span>
                  <span className="flex-1">{note.text}</span>
                  <span className="text-xs text-muted-foreground">
                    {note.time}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="overflow-hidden rounded-full h-11 w-11 bg-secondary hover:bg-secondary/80"
              >
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {user?.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {user?.email_id}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
