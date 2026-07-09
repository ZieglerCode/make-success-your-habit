import type {Metadata} from "next";
import {IsoblPageClient} from "@/components/isobl-page-client";

export const metadata: Metadata = {
  title: "ISOBL | Make Success Your Habit",
  description:
    "Instant Success Online Business Launch: a digital add-on business that fits your existing business.",
};

export default async function IsoblPage() {
  return <IsoblPageClient />;
}
