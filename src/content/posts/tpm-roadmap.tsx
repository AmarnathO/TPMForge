/* eslint-disable react/no-unescaped-entities */
export const meta = {
  slug: "tpm-roadmap",
  title: "The Roadmap Question: How Long Does TPM Upskilling Actually Take?",
  description:
    "A realistic week-by-week plan depends on your starting point and hours per week. Here's how to build one you'll actually follow.",
  date: "2026-06-30",
  category: "Learning",
  readingMinutes: 5,
};

export default function TpmRoadmapPost() {
  return (
    <div className="space-y-5 leading-relaxed">
      <p>
        "How long will it take me to become a TPM?" is the first question every
        engineer asks. The honest answer: it depends entirely on two numbers —
        your <strong>current evidence level</strong> and your{" "}
        <strong>hours per week</strong>. A person at 30% readiness studying 12
        hours a week will get further in a quarter than someone at 60% studying
        2 hours a week.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-zinc-100">
        The three horizons
      </h2>
      <ul className="list-disc space-y-2 pl-6 text-zinc-300">
        <li>
          <strong>Weeks 1–4:</strong> Close the knowledge gaps — roadmap
          frameworks, product metrics, technical fundamentals you skipped. This
          is the fastest-to-win horizon.
        </li>
        <li>
          <strong>Weeks 5–12:</strong> Convert knowledge into application.
          Practice scenario answers, run mock interviews, and start one
          cross-team project at work to generate real evidence.
        </li>
        <li>
          <strong>Months 3–6:</strong> Harden leadership and communication.
          Executive communication, influence without authority, and
          decision-making under uncertainty are the competencies that separate
          associate from senior TPMs.
        </li>
      </ul>

      <h2 className="pt-2 text-lg font-semibold text-zinc-100">
        Why order matters
      </h2>
      <p>
        A personalized roadmap isn't a shuffled course list. Competencies have
        prerequisites — you can't meaningfully practice roadmap prioritization
        without first understanding how quarter planning works. Following a
        topological order is the difference between learning that sticks and
        learning that evaporates.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-zinc-100">
        The plan you'll abandon
      </h2>
      <p>
        Most upskilling plans die in week two because they're built for a
        person who doesn't exist — one with unlimited time and endless focus.
        A realistic roadmap packs hours into weekly buckets sized for your
        actual schedule, and it tells you up front if your timeline is
        feasible. If it isn't, better to know now than to fail quietly later.
      </p>

      <p>
        The metric that matters isn't months elapsed. It's readiness score
        movement — evidence accumulated, gaps closed, and practice attempts
        banked. That's what our progress dashboard tracks, and it's what you
        should optimize, not the calendar.
      </p>
    </div>
  );
}
