"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { STAGE_LABELS, type Stage } from "@/lib/stages";

export function StageChart({ byStage }: { byStage: Record<Stage, number> }) {
  const data = (Object.keys(STAGE_LABELS) as Stage[]).map((stage) => ({
    name: STAGE_LABELS[stage],
    total: byStage[stage],
  }));

  const hasData = data.some((item) => item.total > 0);

  if (!hasData) {
    return (
      <p className="rounded border border-dashed px-4 py-12 text-center text-sm text-gray-500">
        Sem dados para exibir ainda.
      </p>
    );
  }

  return (
    <div className="h-72 w-full rounded border p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="total" fill="#111827" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}