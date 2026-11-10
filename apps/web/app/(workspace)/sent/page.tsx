import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function SentPage() {
  return (
    <PlaceholderPage
      title="Sent Emails"
      phase={11}
      description="A local record of messages submitted through the application — provider-accepted is not the same as delivered."
      planned={[
        "Send history with recipient, account, subject, and timestamp",
        "Provider submission status and message identifier when available",
        "Explicit uncertain state after a timeout, never a blind retry",
        "Error state surfaced without exposing credentials",
      ]}
    />
  );
}
