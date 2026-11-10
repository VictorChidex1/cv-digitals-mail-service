import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PageHeader } from "./page-header";

/**
 * Placeholder for areas whose data services are not implemented yet. It states
 * what is missing instead of simulating content.
 */
export function PlaceholderPage({
  title,
  phase,
  description,
  planned,
}: {
  title: string;
  phase: number | string;
  description: string;
  planned: string[];
}) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={<Badge variant="outline">Phase {phase}</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Not built yet</CardTitle>
          <CardDescription>
            This is a placeholder. No data service exists for this area yet, so
            nothing here is simulated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm font-medium">Planned for this area</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {planned.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
