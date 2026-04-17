import { getOrderedSections } from "@/lib/store-design";
import { CategoriesSection } from "@/components/storefront/sections/CategoriesSection";
import { FooterSection } from "@/components/storefront/sections/FooterSection";
import { HeaderSection } from "@/components/storefront/sections/HeaderSection";
import { HeroSection } from "@/components/storefront/sections/HeroSection";
import { ProductsSection } from "@/components/storefront/sections/ProductsSection";
import { PromoSection } from "@/components/storefront/sections/PromoSection";

const sectionComponents = {
  header: HeaderSection,
  hero: HeroSection,
  categories: CategoriesSection,
  products: ProductsSection,
  promo: PromoSection,
  footer: FooterSection,
};

export function TemplateRenderer({ template, design, data, types }) {
  let sections = getOrderedSections(template);

  if (types?.length) {
    sections = sections.filter((section) => types.includes(section.type));
  }

  return sections.map((section) => {
    const SectionComponent = sectionComponents[section.type];

    if (!SectionComponent) {
      return null;
    }

    return (
      <SectionComponent
        key={section.id}
        section={section}
        design={design}
        data={data}
      />
    );
  });
}
