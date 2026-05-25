import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

import { Search, Star, MessageSquare, Building2, ThumbsUp } from "lucide-react";

export default function Reviews() {
  const [count] = useState(0);

  return (
    <DashboardLayout>
      <PageHeader eyebrow="Feedback" title="Customer Reviews Log" subtitle="Lucide reconstruction test." />

      <div style={{ padding: 40 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Search size={18} />
          <Star size={18} />
          <MessageSquare size={18} />
          <Building2 size={18} />
          <ThumbsUp size={18} />
        </div>

        <h1>Reviews Page Working</h1>

        <p>{count}</p>

        <div>
          <h2>Lucide Test</h2>

          <p>Icons rendering successfully.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
