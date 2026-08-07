import type { Metadata } from "next";
import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata: Metadata = {
  title: "Set up your profile",
};

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              T
            </span>
            <span className="text-lg font-semibold text-zinc-100">TPMForge</span>
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Let&apos;s set the stage
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Three quick questions so we can build your personalized readiness
            plan.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
