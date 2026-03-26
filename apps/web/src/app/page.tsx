import { FeatureGrid } from "@/components/feature-grid";
import { Hero } from "@/components/hero";
import {
  apiPreview,
  navigation,
  productHighlights,
  productPillars,
  setupChecklist,
} from "@/lib/site";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <Hero apiPreview={apiPreview} navigation={navigation} />
      <FeatureGrid
        highlights={productHighlights}
        pillars={productPillars}
        setupChecklist={setupChecklist}
      />
    </main>
  );
}
