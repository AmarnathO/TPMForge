/* eslint-disable react/no-unescaped-entities */
export const meta = {
  slug: "resume-mapping",
  title: "Resume Mapping: Turning Engineering Wins into TPM Evidence",
  description:
    "Hiring managers scan for TPM competencies, not job titles. Here's how a competency-based scan reveals exactly what your resume already proves — and what it hides.",
  date: "2026-07-18",
  category: "Resume",
  readingMinutes: 6,
};

export default function ResumeMappingPost() {
  return (
    <div className="space-y-5 leading-relaxed">
      <p>
        Two resumes can describe the same ten years of work and read completely
        differently to a TPM hiring manager. One says "shipped features." The
        other says "owned a cross-functional launch with 14 dependencies across
        3 teams, resolved a critical-path risk two weeks before GA." Same
        person, different <strong>evidence density</strong>.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-zinc-100">
        What a competency scan does
      </h2>
      <p>
        Instead of asking "does this resume match a TPM JD word-for-word?", a
        competency scan asks six questions across knowledge, application,
        communication, decision-making, execution, and leadership. It scores how
        much evidence your resume provides for each of the ~40 competencies a
        senior TPM exercises in a typical quarter.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-zinc-100">
        Why "strength" reads as silence
      </h2>
      <p>
        Engineers often write resumes that demonstrate deep technical
        knowledge but almost no cross-team application. The scan lights up in
        knowledge and goes dark in communication and execution. That's not a
        judgment on your ability — it's a map of what your resume is currently{" "}
        <em>claiming</em>, which is all an interviewer can work from.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-zinc-100">
        Fix the biggest gap first
      </h2>
      <p>
        Rather than rewriting everything, fix the highest-impact gap. If
        communication scores lowest, add one quantified line to each project:
        who you aligned, how you reported progress, and what decision depended
        on you. Re-scan and watch the score move. That feedback loop — scan,
        rewrite, re-scan — is far more effective than guessing.
      </p>

      <p>
        Your goal isn't a resume that looks like a TPM's. It's a resume that
        gives a TPM hiring manager the evidence they need to say yes before the
        interview even starts.
      </p>
    </div>
  );
}
