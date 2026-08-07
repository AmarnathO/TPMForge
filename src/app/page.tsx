import Link from "next/link";
import {
  Radar,
  Map,
  Bot,
  ClipboardCheck,
  Users,
  ArrowRight,
  MessagesSquare,
  BookOpen,
  FolderKanban,
  Building2,
  BadgeCheck,
  UploadCloud,
  TrendingUp,
  LineChart,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Logo } from "@/components/logo";
import { cn, formatINR } from "@/lib/utils";

const features = [
  {
    icon: Radar,
    title: "Readiness Score & Radar",
    description:
      "Upload your resume and instantly get a TPM readiness score across six dimensions — knowledge, application, communication, decision-making, execution, and leadership.",
    phase: "Live",
    featured: true,
  },
  {
    icon: Map,
    title: "Personalized Roadmap",
    description:
      "A week-by-week plan generated from a real TPM competency graph — never generic course lists.",
    phase: "Live",
  },
  {
    icon: Bot,
    title: "AI Coach",
    description:
      "A 24/7 mentor grounded in the competency graph. Explain concepts, practice scenarios, review answers.",
    phase: "Live",
  },
  {
    icon: ClipboardCheck,
    title: "Competency Assessments",
    description:
      "Practice realistic TPM scenarios and applied quizzes, graded by AI against the competency rubric — every attempt becomes evidence.",
    phase: "Live",
  },
  {
    icon: MessagesSquare,
    title: "Mock Interviews",
    description:
      "Typed and voice interviews graded on executive presence, STAR structure, and technical depth.",
    phase: "Phase 5",
  },
  {
    icon: BadgeCheck,
    title: "Certification Paths",
    description:
      "Associate → TPM → Senior → Principal. Industry-recognized credentials backed by evidence.",
    phase: "Phase 7",
  },
  {
    icon: BookOpen,
    title: "Learning Academy",
    description:
      "Structured lessons, worked examples, and artifacts for every competency in the graph.",
    phase: "Phase 2",
  },
  {
    icon: FolderKanban,
    title: "Project Studio",
    description:
      "Build real TPM artifacts — status reports, launch plans, risk registers — reviewed by AI.",
    phase: "Phase 6",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Network with peers, share artifacts, and get feedback from practicing TPMs.",
    phase: "Phase 8",
  },
  {
    icon: Building2,
    title: "Enterprise & Teams",
    description:
      "Team readiness dashboards, hiring rubrics, and structured upskilling for orgs.",
    phase: "Phase 9",
  },
];

const steps = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Upload your resume",
    description:
      "Our engine maps your experience against the TPM competency graph in seconds.",
  },
  {
    number: "02",
    icon: LineChart,
    title: "Get your readiness score",
    description:
      "See exactly where you stand across six dimensions with a radar view and prioritized gaps.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Follow your roadmap",
    description:
      "A personalized week-by-week plan — coach, assessments, and practice woven together.",
  },
];

const audiences = [
  "Software Engineers",
  "QA Engineers",
  "Tech Leads",
  "Engineering Managers",
  "Product Managers",
  "Project Managers",
  "Business Analysts",
  "Consultants",
  "Existing TPMs",
  "Program Coordinators",
  "Data Scientists",
  "DevOps Engineers",
];

const stats = [
  { value: "6", label: "competency dimensions" },
  { value: "40+", label: "competencies mapped" },
  { value: "1", label: "unified roadmap" },
  { value: "24/7", label: "AI coach" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} withWordmark />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {[
              ["How it works", "#how-it-works"],
              ["Features", "#features"],
              ["Pricing", "#pricing"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:text-zinc-100"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-zinc-100 sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.16),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-20 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
          <div className="text-center lg:text-left">
            <Reveal>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
                <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-indigo-400" />
                The career OS for Technical Program Managers
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mx-auto max-w-2xl text-balance text-4xl font-bold leading-[1.08] tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl lg:mx-0">
                Become a world-class{" "}
                <span className="animated-gradient bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Technical Program Manager
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-400 lg:mx-0">
                Upload your resume, get your TPM readiness score, and follow a
                personalized roadmap built on a real competency graph. Coach,
                assessments, interviews, and certification — in one place.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:brightness-110 btn-shimmer"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    Get started <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <a
                  href="#pricing"
                  className="rounded-full border border-zinc-700 px-8 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                >
                  See membership
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <dl className="mx-auto mt-14 grid max-w-lg grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:mx-0">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-center lg:text-left"
                  >
                    <dd className="text-2xl font-bold text-zinc-50">
                      {s.value}
                    </dd>
                    <dt className="mt-0.5 text-xs text-zinc-500">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <RadarVisual />
        </div>
      </section>

      {/* AUDIENCE MARQUEE */}
      <section className="border-y border-white/5 bg-white/[0.02] py-6">
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="marquee-track flex w-max gap-12">
            {[...audiences, ...audiences].map((a, i) => (
              <span
                key={`${a}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap text-sm text-zinc-500"
              >
                <span className="h-1 w-1 rounded-full bg-indigo-500/60" />
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-28"
      >
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              From resume to readiness in three steps
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              No guesswork, no generic advice. Every recommendation traces back
              to a single source of truth — the TPM competency graph.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="group relative h-full rounded-3xl border border-white/5 bg-white/[0.03] p-8 transition hover:border-indigo-500/40 hover:bg-white/[0.05]">
                <span className="absolute right-6 top-6 text-5xl font-bold text-white/5 transition group-hover:text-indigo-500/15">
                  {step.number}
                </span>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 transition group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="scroll-mt-20 border-t border-white/5 bg-white/[0.02] py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
                The platform
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
                Everything you need to get the TPM role
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                One competency graph powering every surface — from your first
                score to your first certification.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 100}
                className={cn(f.featured && "sm:col-span-2")}
              >
                <div
                  className={cn(
                    "group relative h-full overflow-hidden rounded-3xl border p-8 transition duration-300",
                    f.featured
                      ? "border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 via-zinc-900/60 to-zinc-950 hover:border-indigo-400/50"
                      : "border-white/5 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-white/[0.05]"
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl transition duration-500",
                      f.featured ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  />
                  <div className="relative">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 transition duration-300 group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white">
                        <f.icon className="h-6 w-6" />
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium",
                          f.phase === "Live"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : f.phase === "Now building"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : "border-white/10 bg-white/5 text-zinc-500"
                        )}
                      >
                        {f.phase === "Live"
                          ? "Live"
                          : f.phase === "Now building"
                            ? "Now building"
                            : `Coming · ${f.phase}`}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {f.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
              Membership
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Simple, honest pricing
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              One membership. Every feature — coach, assessments, roadmap, and
              dashboard. Cancel anytime.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <Reveal delay={100}>
            <div className="flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-8">
              <h3 className="text-sm font-semibold text-zinc-200">
                Monthly membership
              </h3>
              <p className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
                {formatINR(2000)}
                <span className="text-lg font-medium text-zinc-400">/month</span>
              </p>
              <p className="mt-2 text-sm text-zinc-500">Billed monthly</p>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-zinc-400">
                {[
                  "Unlimited AI Coach",
                  "Full competency assessments",
                  "Personalized roadmap",
                  "Readiness dashboard",
                  "Cancel anytime",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 rounded-full border border-zinc-700 px-6 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-zinc-50"
              >
                Choose monthly
              </Link>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-[1.5rem] p-8",
                "border border-indigo-500/40 bg-gradient-to-br from-indigo-950/50 via-zinc-900/60 to-zinc-950"
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Annual membership
                  </h3>
                  <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
                    Save 20%
                  </span>
                </div>
                <p className="mt-4 text-4xl font-bold tracking-tight text-zinc-50">
                  {formatINR(1600)}
                  <span className="text-lg font-medium text-zinc-400">/month</span>
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Billed {formatINR(19200)} annually
                </p>
                <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-zinc-400">
                  {[
                    "Everything in monthly",
                    "Two months free",
                    "Priority support",
                    "Future feature access",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="relative z-10 mt-8 block overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 btn-shimmer"
                >
                  <span className="relative z-10">Choose annual</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={32} withWordmark />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              The AI-powered career operating system for Technical Program
              Managers.
            </p>
            <a
              href="mailto:hello@tpmforge.app"
              className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              <Mail className="h-4 w-4" /> hello@tpmforge.app
            </a>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-200">Product</p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-500">
              {[
                ["Features", "#features"],
                ["How it works", "#how-it-works"],
                ["Pricing", "#pricing"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="transition hover:text-zinc-100">
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/login" className="transition hover:text-zinc-100">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition hover:text-zinc-100">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-200">Company</p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-500">
              {["About", "Blog", "Careers", "Contact"].map((label) => (
                <li key={label}>
                  <a href="#" className="transition hover:text-zinc-100">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-200">Legal</p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-500">
              {["Privacy policy", "Terms of service", "Cookie policy"].map(
                (label) => (
                  <li key={label}>
                    <a href="#" className="transition hover:text-zinc-100">
                      {label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 sm:flex-row">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} TPMForge. All rights reserved.
            </p>
            <p className="text-xs text-zinc-600">
              Built on a real TPM competency graph.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RadarVisual() {
  const values = [0.85, 0.6, 0.95, 0.5, 0.7, 0.65];
  const cx = 100;
  const cy = 100;
  const radius = 88;

  const points = values.map((v, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const r = radius * v;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });

  const polygonPoints = points.map((p) => p.join(",")).join(" ");

  const dimensions = [
    "Knowledge",
    "Communication",
    "Decision",
    "Leadership",
    "Execution",
    "Application",
  ];

  return (
    <div className="relative hidden lg:block">
      <div className="absolute -inset-10 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur animate-float">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <p className="text-xs text-zinc-500">Readiness score</p>
            <p className="text-2xl font-bold text-zinc-50">
              78
              <span className="text-sm font-normal text-zinc-500">/100</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-emerald-400" />
            On track
          </span>
        </div>

        <div className="relative mx-auto mt-6 h-56 w-56">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            {[88, 59, 29].map((r) => (
              <circle
                key={r}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            ))}
            {points.map((_, i) => (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + radius * Math.cos((i * 60 - 90) * (Math.PI / 180))}
                y2={cy + radius * Math.sin((i * 60 - 90) * (Math.PI / 180))}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            ))}
            <polygon
              points={polygonPoints}
              fill="url(#radar-fill)"
              stroke="url(#radar-stroke)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {points.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" fill="#a5b4fc" />
            ))}
            <defs>
              <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(129,140,248,0.45)" />
                <stop offset="100%" stopColor="rgba(217,70,239,0.2)" />
              </linearGradient>
              <linearGradient id="radar-stroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {dimensions.map((d, i) => (
            <span
              key={d}
              className="flex items-center gap-1.5 text-[11px] text-zinc-500"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: points[i][0] > 120 ? "#818cf8" : "#71717a",
                }}
              />
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="animate-float-slow absolute -left-6 bottom-10 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3 shadow-xl backdrop-blur">
        <p className="text-xs text-zinc-500">Roadmap</p>
        <p className="mt-1 text-sm font-semibold text-zinc-100">
          Day 9 of 14 · API design
        </p>
        <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        </div>
      </div>

      <div className="animate-float absolute -right-4 top-6 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3 shadow-xl backdrop-blur">
        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Bot className="h-3.5 w-3.5 text-indigo-400" /> AI Coach
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-100">
          Practice scenario reviewed ✓
        </p>
      </div>
    </div>
  );
}
