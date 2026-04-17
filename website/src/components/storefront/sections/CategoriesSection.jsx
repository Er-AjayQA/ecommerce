import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function CategoriesSection({ data }) {
  const categories = data.categories;
  const sidebarMenu = data.menus.sidebar;

  if (categories.length === 0 && sidebarMenu.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="mx-auto grid max-w-[var(--store-content-max-width)] gap-6 px-4 py-10 lg:grid-cols-[260px_1fr] lg:px-6">
        {sidebarMenu.length > 0 && (
          <aside className="rounded-lg bg-sidebar p-4 text-sidebar-foreground shadow-[var(--shadow-md)]">
            <nav className="grid gap-1">
              {sidebarMenu.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
        )}

        <div className={sidebarMenu.length > 0 ? "grid gap-4 md:grid-cols-3" : "grid gap-4 md:grid-cols-3 lg:col-span-2"}>
          {categories.map((category) => (
            <Card key={category.id || category.name} className="overflow-hidden rounded-lg">
              {category.image && (
                <div className="relative h-36">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold">{category.name}</h3>
                {category.count && (
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
