"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight, Search, ShoppingCart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";

function NewsletterMenuForm({ compact = false }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setMessage("Subscribed");
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "grid gap-2 p-2" : "grid min-w-64 gap-2 rounded-md p-3"}
    >
      <p className="text-sm font-medium text-foreground">Newsletter</p>
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="h-9"
          required
        />
        <Button size="sm">Subscribe</Button>
      </div>
      {message && <p className="text-xs text-primary">{message}</p>}
    </form>
  );
}

function MenuLink({ item, className, children }) {
  if (item.type === "newsletter") {
    return (
      <button type="button" className={className}>
        {children || item.label}
      </button>
    );
  }

  const href = item.href || "#";
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#");

  if (isExternal) {
    return (
      <a href={href} className={className}>
        {children || item.label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children || item.label}
    </Link>
  );
}

function HeaderMenu({ items, className = "" }) {
  if (!items.length) return null;

  return (
    <nav className={["flex justify-center", className].join(" ")}>
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {items.map((item) => {
          const secondLevelItems = item.children || [];
          const hasChildren = secondLevelItems.length > 0;
          const isNewsletter = item.type === "newsletter";
          const showRegularChildren = hasChildren && !isNewsletter;

          return (
            <li key={item.label} className="group/menu-item relative">
              <MenuLink
                item={item}
                className="flex items-center gap-1 py-2 font-medium hover:text-foreground"
              >
                <span>{item.label}</span>
                {(showRegularChildren || isNewsletter) && <ChevronDown className="size-3.5" />}
              </MenuLink>

              {isNewsletter && (
                <div className="invisible absolute left-1/2 top-full z-50 min-w-72 -translate-x-1/2 pt-2 opacity-0 transition-all group-hover/menu-item:visible group-hover/menu-item:opacity-100">
                  <div className="rounded-lg border border-border bg-popover text-popover-foreground shadow-[var(--shadow-lg)]">
                    <NewsletterMenuForm />
                  </div>
                </div>
              )}

              {showRegularChildren && (
                <div className="invisible absolute left-1/2 top-full z-50 min-w-56 -translate-x-1/2 pt-2 opacity-0 transition-all group-hover/menu-item:visible group-hover/menu-item:opacity-100">
                  <div className="rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-[var(--shadow-lg)]">
                    {secondLevelItems.map((child) => {
                      const thirdLevelItems = child.children || [];
                      const hasThirdLevel = thirdLevelItems.length > 0;

                      return (
                        <div key={child.label} className="group/sub-menu relative">
                          {child.type === "newsletter" ? (
                            <NewsletterMenuForm compact />
                          ) : (
                            <MenuLink
                              item={child}
                              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                            >
                              <span>{child.label}</span>
                              {hasThirdLevel && <ChevronRight className="size-3.5" />}
                            </MenuLink>
                          )}

                          {hasThirdLevel && child.type !== "newsletter" && (
                            <div className="invisible absolute left-full top-0 z-50 min-w-52 pl-2 opacity-0 transition-all group-hover/sub-menu:visible group-hover/sub-menu:opacity-100">
                              <div className="rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-[var(--shadow-lg)]">
                                {thirdLevelItems.map((grandChild) =>
                                  grandChild.type === "newsletter" ? (
                                    <NewsletterMenuForm key={grandChild.label} compact />
                                  ) : (
                                    <MenuLink
                                      key={grandChild.label}
                                      item={grandChild}
                                      className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function HeaderSection({ section, data }) {
  const router = useRouter();
  const { itemCount, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const showSearch = section.settings?.showSearch;
  const isSticky = section.settings?.sticky;
  const headerMenu = data.menus.header;
  const storeName =
    section.settings?.storeName ||
    data.design?.theme_config?.storeName ||
    data.design?.theme_config?.name ||
    "";

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const searchInput = (
    <form
      onSubmit={handleSearchSubmit}
      className="hidden min-w-0 max-w-xl flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 md:flex"
    >
      <Search className="size-4 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        placeholder={section.settings?.searchPlaceholder || "Search"}
      />
    </form>
  );

  return (
    <header
      className={[
        "z-40 border-b border-border bg-background/95 backdrop-blur",
        isSticky ? "sticky top-0" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[var(--store-content-max-width)] flex-col gap-3 px-4 py-4 lg:px-6">
        <div
          className={
            showSearch
              ? "flex items-center justify-between gap-4"
              : "grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]"
          }
        >
          {storeName && (
            <Link href="/" className="text-xl font-bold tracking-tight">
              {storeName}
            </Link>
          )}

          {!showSearch && (
            <HeaderMenu items={headerMenu} className="hidden min-w-0 lg:flex" />
          )}

          {showSearch && searchInput}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Account">
              <UserRound className="size-4" />
            </Button>
            <Button size="sm" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="size-4" />
              Cart{itemCount > 0 ? ` (${itemCount})` : ""}
            </Button>
          </div>
        </div>

        {showSearch && (
          <HeaderMenu items={headerMenu} className="border-t border-border pt-2" />
        )}

        {!showSearch && (
          <HeaderMenu items={headerMenu} className="lg:hidden" />
        )}
      </div>
    </header>
  );
}
