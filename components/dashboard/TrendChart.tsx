"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type DataPoint = { label: string; score: number }

type Props = { data: DataPoint[] }

export function TrendChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="bg-surface border border-border-subtle rounded-xl p-5 flex flex-col">
        <p className="text-ink text-sm font-semibold mb-1">Score Trend</p>
        <div className="flex-1 flex items-center justify-center min-h-[180px]">
          <p className="text-ink-faint text-sm">Complete 2+ interviews to see your trend.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5 flex flex-col">
      <p className="text-ink text-sm font-semibold mb-4">Score Trend</p>
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0.015 148)" strokeOpacity={0.5} />
            <XAxis
              dataKey="label"
              tick={{ fill: "oklch(0.65 0.010 148)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2.5, 5, 7.5, 10]}
              tick={{ fill: "oklch(0.65 0.010 148)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.18 0.014 148)",
                border: "1px solid oklch(0.34 0.018 148)",
                borderRadius: "8px",
                color: "oklch(0.95 0.005 148)",
                fontSize: 12,
              }}
              formatter={(v) => [typeof v === "number" ? v.toFixed(1) : v, "Score"]}
              labelStyle={{ color: "oklch(0.65 0.010 148)" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="oklch(0.72 0.20 148)"
              strokeWidth={2}
              dot={{ fill: "oklch(0.72 0.20 148)", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "oklch(0.78 0.20 148)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
