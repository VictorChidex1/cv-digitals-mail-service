import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function FollowUpsPage() {
  return (
    <PlaceholderPage
      title="Follow-ups"
      phase={13}
      description="The next appropriate action after an initial email or a reply. A due follow-up never sends by itself."
      planned={[
        "Due queue with linked prospect and original message",
        "Cadence and stop conditions configured by the operator",
        "Follow-up drafts prepared for review",
        "Human approval and explicit send action",
      ]}
    />
  );
}
