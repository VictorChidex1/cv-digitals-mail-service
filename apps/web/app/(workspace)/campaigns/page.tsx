import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function CampaignsPage() {
  return (
    <PlaceholderPage
      title="Campaigns"
      phase={8}
      description="Organise a set of prospects around one outreach effort, without bypassing per-message review."
      planned={[
        "Campaign records with segment and offer angle",
        "Prospect membership and per-prospect campaign state",
        "Sending-account assignment and daily target display",
        "Allocation checks for 20 + 20 Gmail targets",
      ]}
    />
  );
}
