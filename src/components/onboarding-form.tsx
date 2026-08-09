"use client";

import { useActionState } from "react";
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";

const initialState: OnboardingState = { status: "idle" };

const CURRENT_ROLES = [
  "Software Engineer",
  "Engineering Manager",
  "Program Manager",
  "Product Manager",
  "Project Manager",
  "Data Scientist",
  "QA / SDET",
  "Other",
];

const TARGET_ROLES = [
  "Associate TPM",
  "TPM",
  "Senior TPM",
  "Staff TPM",
  "Principal TPM",
  "Director of Program Management",
];

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          {state.message}
        </div>
      )}

      <div>
        <label
          htmlFor="currentRole"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          What best describes your current role?
        </label>
        <select
          id="currentRole"
          name="currentRole"
          required
          defaultValue=""
          className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="" disabled>
            Select your role
          </option>
          {CURRENT_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="targetRole"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          What TPM role are you targeting?
        </label>
        <select
          id="targetRole"
          name="targetRole"
          required
          defaultValue=""
          className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="" disabled>
            Select your target role
          </option>
          {TARGET_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="weeklyHours"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Hours per week
        </label>
        <input
          id="weeklyHours"
          name="weeklyHours"
          type="number"
          min={1}
          max={40}
          required
          placeholder="e.g. 5"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save"}
      </button>

      <p className="text-xs text-zinc-500">
        We use these to calibrate your TPM readiness score and personalize your
        roadmap. You can change them anytime in settings.
      </p>
    </form>
  );
}
