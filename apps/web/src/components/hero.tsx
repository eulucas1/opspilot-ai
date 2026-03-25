import type { HealthStatus, NavigationItem } from "@opspilot/shared-types";

type HeroProps = {
  apiPreview: HealthStatus;
  navigation: NavigationItem[];
};

export function Hero({ apiPreview, navigation }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-white/80 px-6 py-8 shadow-soft backdrop-blur sm:px-10 sm:py-10">
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-copper/10 blur-3xl" />

      <div className="relative flex flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-copper">
              Ops Workflow Platform
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              OpsPilot AI
            </h1>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navigation.map((item) => (
              <a
                key={item.href}
                className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
                href={item.href}
                title={item.description}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <p className="max-w-2xl text-lg leading-8 text-ink/75 sm:text-xl">
              A professional project foundation for orchestrating operations workflows,
              approvals, and internal process visibility across product and support teams.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                <p className="text-sm font-medium text-ink/60">Frontend</p>
                <p className="mt-2 text-lg font-semibold text-ink">Next.js + Tailwind</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                <p className="text-sm font-medium text-ink/60">Backend</p>
                <p className="mt-2 text-lg font-semibold text-ink">FastAPI + SQLAlchemy</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                <p className="text-sm font-medium text-ink/60">Infra</p>
                <p className="mt-2 text-lg font-semibold text-ink">Docker + CI</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-ink/10 bg-ink p-6 text-sand">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mist">
              API Baseline
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-mist/80">Service</p>
                <p className="mt-2 text-lg font-semibold">{apiPreview.service}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-mist/80">Status</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-300">
                    {apiPreview.status}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-mist/80">
                    Environment
                  </p>
                  <p className="mt-2 text-lg font-semibold">{apiPreview.environment}</p>
                </div>
              </div>
              <p className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-mist">
                Endpoint ready at <span className="font-semibold">GET /health</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
