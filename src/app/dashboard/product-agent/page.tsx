import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { ProductAgent } from "@/components/product-agent";
import {
  getLatestProductAssessment,
  productAssessmentFromRow,
} from "@/lib/product-assessments";

export const metadata: Metadata = {
  title: "Product Mentor",
};

export const maxDuration = 60;

export default async function ProductAgentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const row = await getLatestProductAssessment(supabase, user.id);
  const initial = row ? productAssessmentFromRow(row) : null;

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm text-violet-400">Product understanding</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Product Mentor Agent
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            An AI product mentor evaluates how you think about product
            management — real scenarios, metrics, and trade-offs — and builds a
            personalized learning roadmap.
          </p>
        </div>
        <ProductAgent initial={initial} />
      </div>
    </AppShell>
  );
}
