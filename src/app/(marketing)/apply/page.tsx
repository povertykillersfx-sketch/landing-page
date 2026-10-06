import type { Metadata } from "next";
import { ReserveForm } from "@/components/form/reserve-form";
import { getCountryOptions } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Apply",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";

export default function ApplyPage() {
  return <ReserveForm countries={getCountryOptions()} />;
}
