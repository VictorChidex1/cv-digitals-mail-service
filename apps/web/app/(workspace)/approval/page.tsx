import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function ApprovalPage() {
  return (
    <PlaceholderPage
      title="Approval Queue"
      phase={10}
      description="A deliberate review step: approval applies to one exact draft version."
      planned={[
        "Queue with recipient, sender, subject, and full preview",
        "Approve, reject, or return for editing",
        "Approval invalidated when approved content changes",
        "Suppression and duplicate warnings before approval",
      ]}
    />
  );
}
