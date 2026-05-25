import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

export default function Reviews() {
  const [count] = useState(0);

  return (
    <DashboardLayout>
      <PageHeader eyebrow="Feedback" title="Customer Reviews Log" subtitle="Testing PageHeader reconstruction." />

      <div style={{ padding: 40 }}>
        <h1>Reviews Page Working</h1>

        <p>{count}</p>

        <div>
          <h2>Test Review Card</h2>

          <p>DashboardLayout + PageHeader test.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
