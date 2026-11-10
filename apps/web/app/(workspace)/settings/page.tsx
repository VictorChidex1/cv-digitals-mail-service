import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      phase="6 and 15"
      description="Operator preferences and sending configuration. Changes to limits, credentials, or automation require explicit confirmation."
      planned={[
        "Sending targets and per-account allocation",
        "Default signature and outreach defaults",
        "Sync intervals and backup preferences",
        "Local API and security configuration status",
      ]}
    />
  );
}
