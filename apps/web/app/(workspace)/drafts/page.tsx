import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function DraftsPage() {
  return (
    <PlaceholderPage
      title="Drafts"
      phase={9}
      description="Prepare personalised messages before anything is approved or sent."
      planned={[
        "Draft editor and preview with linked prospect and campaign",
        "Sender account selection",
        "Cold Email Master Method checklist and quality warnings",
        "Draft versions, separate from approval and send state",
      ]}
    />
  );
}
