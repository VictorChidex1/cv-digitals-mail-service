import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function SuppressionPage() {
  return (
    <PlaceholderPage
      title="Suppression List"
      phase={10}
      description="Do-not-contact records that take precedence over campaigns and daily targets."
      planned={[
        "Manual addition with opt-out reason and source",
        "Email normalisation for reliable matching",
        "Checks before approval and again immediately before sending",
        "Import with preview and validation",
      ]}
    />
  );
}
