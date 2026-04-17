import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection({ section, data }) {
  const settings = section.settings || {};
  const image = settings.image || data.collections[0]?.image || data.products[0]?.image;

  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-[var(--store-content-max-width)] gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-14">
        <div className="flex flex-col justify-center gap-5">
          {settings.eyebrow && <Badge className="w-fit">{settings.eyebrow}</Badge>}
          <div className="space-y-4">
            {settings.title && (
              <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                {settings.title}
              </h1>
            )}
            {settings.subtitle && (
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                {settings.subtitle}
              </p>
            )}
          </div>
          {(settings.primaryActionLabel || settings.secondaryActionLabel) && (
            <div className="flex flex-col gap-3 sm:flex-row">
              {settings.primaryActionLabel && (
                <a
                  className={cn(buttonVariants({ size: "lg" }))}
                  href={settings.primaryActionHref || "#"}
                >
                  {settings.primaryActionLabel}
                </a>
              )}
              {settings.secondaryActionLabel && (
                <a
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                  href={settings.secondaryActionHref || "#"}
                >
                  {settings.secondaryActionLabel}
                </a>
              )}
            </div>
          )}
        </div>

        {image && (
          <div className="relative min-h-[320px] overflow-hidden rounded-lg bg-card shadow-[var(--shadow-lg)]">
            <Image
              src={image}
              alt={settings.imageAlt || settings.title || ""}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            {(settings.offerLabel || settings.offerTitle) && (
              <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 p-4 shadow-[var(--shadow-md)] backdrop-blur">
                {settings.offerLabel && (
                  <p className="text-sm text-muted-foreground">{settings.offerLabel}</p>
                )}
                {settings.offerTitle && (
                  <p className="text-2xl font-bold">{settings.offerTitle}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
