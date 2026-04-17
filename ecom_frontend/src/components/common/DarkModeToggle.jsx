import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // apply theme globally
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        h-11 w-11 rounded-full
        bg-secondary dark:bg-secondary/70
        flex items-center justify-center relative
        hover:scale-105 transition
        focus:outline-none
      "
    >
      {/* Sun */}
      <Sun
        className={`
          h-5 w-5 text-yellow-500 transition-all duration-300
          ${theme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"}
        `}
      />

      {/* Moon */}
      <Moon
        className={`
          h-5 w-5 text-blue-400 absolute transition-all duration-300
          ${theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"}
        `}
      />
    </button>
  );
}