import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function ProspectsPage() {
  return (
    <PlaceholderPage
      title="Prospects"
      phase={7}
      description="Businesses and contacts, with the research and evidence that justify contacting them."
      planned={[
        "Create, edit, and qualify prospect records",
        "Search and filter by status, industry, location, and source",
        "Research notes with source references and verified/unverified flags",
        "Duplicate detection and CSV import with preview",
      ]}
    />
  );
}
