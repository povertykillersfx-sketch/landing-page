import type { Metadata } from "next";
import { ApplyForm } from "@/components/form/apply-form";
import { getCountryOptions } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Apply",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";

export default function ApplyPage() {
  return (
    <div className="page-narrow">
      <p className="eyebrow">Application</p>
      <h1>Let&apos;s Get To Know Your Trading Experience</h1>
      <p className="lede">Answer a few quick questions before booking your call.</p>
      <ApplyForm countries={getCountryOptions()} />
    </div>
  );
}
