import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function AccountsPage() {
  return (
    <PlaceholderPage
      title="Email Accounts"
      phase={6}
      description="The mailboxes this workspace sends from and reads, behind a provider-neutral model."
      planned={[
        "Primary and secondary Gmail accounts plus the Namecheap mailbox",
        "SMTP and IMAP connection tests that send nothing",
        "Credential handling that never stores plaintext passwords in SQLite",
        "Per-account daily caps and connection status",
      ]}
    />
  );
}
