import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      phase={14}
      description="Measured progress, reconciled to underlying records. No tracking pixels and no invented numbers."
      planned={[
        "Prepared, approved, and sent counts by date and account",
        "Reply and follow-up metrics",
        "Campaign reporting from recorded data",
        "Explicit definitions for every metric shown",
      ]}
    />
  );
}
