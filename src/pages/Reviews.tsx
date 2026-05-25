import { useState } from "react";
import { motion } from "framer-motion";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

import { Search, Star, MessageSquare, Building2, ThumbsUp } from "lucide-react";

export default function Reviews() {
  const [count] = useState(0);

  return (
    <DashboardLayout>
      <PageHeader eyebrow="Feedback" title="Customer Reviews Log" subtitle="Framer Motion reconstruction test." />

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            padding: 20,
            borderRadius: 12,
            background: "rgba(255,255,255,0.4)",
          }}
        >
          <h1>Reviews Page Working</h1>

          <p>{count}</p>

          <div>
            <h2>Motion Test</h2>

            <p>Framer Motion rendering successfully.</p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
