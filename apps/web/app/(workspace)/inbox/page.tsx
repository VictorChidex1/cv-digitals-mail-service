import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function InboxPage() {
  return (
    <PlaceholderPage
      title="Replies / Inbox"
      phase={12}
      description="Synchronised mailbox messages, linked to the outreach they answer."
      planned={[
        "IMAP sync with resumable cursors per account",
        "Deduplication by provider message identity",
        "Reply list and detail with mailbox selector",
        "Thread association to prospect and original outreach",
      ]}
    />
  );
}
