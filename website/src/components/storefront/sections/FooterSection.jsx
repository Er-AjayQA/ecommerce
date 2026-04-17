"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function NewsletterFooterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setMessage("Subscribed");
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-2">
      <p className="text-sm font-medium">Newsletter</p>
      <div className="flex max-w-sm gap-2">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="h-9 bg-sidebar-foreground/10 text-sidebar-foreground placeholder:text-sidebar-foreground/60"
          required
        />
        <Button size="sm" variant="secondary">
          Get updates
        </Button>
      </div>
      {message && <p className="text-xs opacity-80">{message}</p>}
    </form>
  );
}

export function FooterSection({ data }) {
  const footerMenu = data.menus.footer.filter((item) => item.type !== "newsletter");
  const storeName =
    data.design?.theme_config?.storeName ||
    data.design?.theme_config?.name ||
    "";

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-[var(--store-content-max-width)] gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.8fr_1.1fr] lg:px-6">
        {storeName && (
          <div>
            <h2 className="text-xl font-bold">{storeName}</h2>
          </div>
        )}

        {footerMenu.length > 0 && (
          <div>
          <nav className="mt-3 grid gap-2 text-sm opacity-85">
            {footerMenu.map((item) => (
                <a key={item.label} href={item.href} className="hover:opacity-100">
                  {item.label}
                </a>
            ))}
          </nav>
          </div>
        )}

        <div className="md:justify-self-end">
          <NewsletterFooterForm />
        </div>
      </div>
    </footer>
  );
}
