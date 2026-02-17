import { motion } from "framer-motion";
import { Database, TrendingUp, TrendingDown, Star } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";

const kpis = [
  { label: "Total Reviews Analyzed", value: "127,450", icon: Database, color: "text-accent" },
  { label: "Positive Reviews", value: "68%", icon: TrendingUp, color: "text-positive" },
  { label: "Negative Reviews", value: "32%", icon: TrendingDown, color: "text-negative" },
  { label: "Avg Sentiment Score", value: "0.74", icon: Star, color: "text-neutral" },
];

const donutData = [
  { name: "5 Stars", value: 42, color: "hsl(160, 84%, 39%)" },
  { name: "4 Stars", value: 26, color: "hsl(160, 84%, 50%)" },
  { name: "3 Stars", value: 12, color: "hsl(45, 93%, 58%)" },
  { name: "2 Stars", value: 11, color: "hsl(350, 89%, 65%)" },
  { name: "1 Star", value: 9, color: "hsl(350, 89%, 50%)" },
];

const satisfactionData = [
  { factor: "Food Quality", value: 89 },
  { factor: "Service", value: 76 },
  { factor: "Ambiance", value: 71 },
  { factor: "Value for Money", value: 65 },
  { factor: "Wait Time", value: 42 },
];

const dissatisfactionData = [
  { factor: "Wait Time", value: 78 },
  { factor: "Poor Service", value: 71 },
  { factor: "Pricing", value: 58 },
  { factor: "Food Quality", value: 34 },
  { factor: "Cleanliness", value: 28 },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="font-medium text-foreground">{label || payload[0]?.name}</p>
      <p className="text-muted-foreground">{payload[0]?.value}%</p>
    </div>
  );
};

export default function Overview() {
  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={item}>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground">Customer review intelligence at a glance</p>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{kpi.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Charts row */}
        <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Donut */}
          <div className="glass-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Review Distribution by Stars</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3} stroke="none">
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} ({d.value}%)
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction */}
          <div className="glass-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Top Satisfaction Factors</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={satisfactionData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="factor" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="hsl(160, 84%, 39%)" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Dissatisfaction */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Top Dissatisfaction Factors</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dissatisfactionData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="factor" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(350, 89%, 60%)" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
