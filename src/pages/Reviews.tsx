import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Reviews() {
  const [count] = useState(0);

  return (
    <DashboardLayout>
      <div style={{ padding: 40 }}>
        <h1>Reviews Page Working</h1>

        <p>{count}</p>

        <div>
          <h2>Test Review Card</h2>

          <p>DashboardLayout reconstruction test.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
