import { motion } from "framer-motion";
import { BarChart3, Activity, TrendingUp, Users } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

const trend = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
  rating: 3.6 + Math.sin(i / 2) * 0.2 + i * 0.04,
  reviews: 800 + i * 90 + Math.round(Math.random() * 120),
}));

const channels = [
  { ch: "Yelp", volume: 6420 },
  { ch: "Google", volume: 4231 },
  { ch: "OpenTable", volume: 1402 },
  { ch: "TripAdvisor", volume: 794 },
];

export default function Performance() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operations"
        title="Performance Metrics"
        subtitle="Track ratings, review volume, and channel performance over time."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Avg rating (12m)", value: "4.0 ★", icon: Activity },
          { label: "Reviews collected", value: "12,847", icon: BarChart3 },
          { label: "Repeat visit rate", value: "38%", icon: Users },
          { label: "Mentions growth", value: "+23%", icon: TrendingUp },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="mt-2 font-data text-3xl font-bold text-foreground">{k.value}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                <k.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-base font-semibold">Rating & Review Volume — 12 months</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[3, 5]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="rating" stroke="hsl(var(--positive))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="mb-4 font-display text-base font-semibold">Reviews by Channel</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels} layout="vertical">
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="ch" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
