import { LayoutShell } from "@/components/storefront/LayoutShell";
import { TemplateRenderer } from "@/components/storefront/TemplateRenderer";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";

export function StorefrontRenderer({ data }) {
  const { design } = data;

  return (
    <ThemeProvider theme={design.theme_config}>
      <LayoutShell layout={design.layout_config}>
        <TemplateRenderer
          template={design.template_config}
          design={design}
          data={data}
        />
      </LayoutShell>
    </ThemeProvider>
  );
}
