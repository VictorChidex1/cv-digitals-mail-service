import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function ActivityPage() {
  return (
    <PlaceholderPage
      title="Activity Log"
      phase={14}
      description="A chronological record of important operations, kept without secrets or unnecessary message content."
      planned={[
        "Prospect, draft, and approval events",
        "Send attempts and provider outcomes",
        "Mailbox sync runs and failures",
        "Settings and account changes",
      ]}
    />
  );
}
