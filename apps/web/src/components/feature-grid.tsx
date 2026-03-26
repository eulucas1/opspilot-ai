import type { ProductHighlight, ProductPillar } from "@/types";

type FeatureGridProps = {
  highlights: ProductHighlight[];
  pillars: ProductPillar[];
  setupChecklist: string[];
};

export function FeatureGrid({
  highlights,
  pillars,
  setupChecklist,
}: FeatureGridProps) {
  return (
    <section className="grid gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-8">
        <div id="architecture" className="rounded-[2rem] border border-ink/10 bg-white/70 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
                Product Foundation
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                Initial capabilities with room to grow
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-ink/10 bg-sand/60 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                  {item.eyebrow}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/70">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div id="backlog" className="grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[1.75rem] border border-ink/10 bg-white/75 p-6 shadow-soft"
            >
              <h3 className="text-xl font-semibold text-ink">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/70">{pillar.description}</p>
              <ul className="mt-5 space-y-3 text-sm text-ink/80">
                {pillar.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-copper" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <aside
        id="setup"
        className="rounded-[2rem] border border-ink/10 bg-ink px-6 py-7 text-sand shadow-soft"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mist">
          Local Setup Snapshot
        </p>
        <h2 className="mt-3 text-2xl font-semibold">What is already in place</h2>
        <ul className="mt-6 space-y-4">
          {setupChecklist.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-7 text-mist">
              <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mist">
            Next Step
          </p>
          <p className="mt-3 text-sm leading-7 text-mist">
            Add domain models, authentication, and AI-assisted workflows on top of this
            structure when the product boundaries are validated.
          </p>
        </div>
      </aside>
    </section>
  );
}
