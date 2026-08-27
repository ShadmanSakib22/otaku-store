"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  LIGHT_NOVEL: "Light Novel",
  MANGA: "Manga",
  MERCH: "Merch",
};

const TYPE_COLORS: Record<string, string> = {
  LIGHT_NOVEL: "#6366f1",
  MANGA: "#10b981",
  MERCH: "#f59e0b",
};

interface SalesByTypeDatum {
  type: string;
  revenue: number;
}

export function SalesByTypeChart({
  data,
  dayData,
  allDays,
}: {
  data: SalesByTypeDatum[];
  dayData: { date: string; type: string; revenue: number }[];
  allDays: { date: string; revenue: number }[];
}) {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);

    const byType = new Map<string, number>();
    for (const entry of dayData) {
      const date = new Date(entry.date);
      if (date >= startDate) {
        byType.set(entry.type, (byType.get(entry.type) ?? 0) + entry.revenue);
      }
    }
    return data.map((d) => ({ type: d.type, revenue: byType.get(d.type) ?? 0 }));
  }, [data, dayData, timeRange]);

  const chartConfig = {
    revenue: { label: "Revenue" },
    ...Object.fromEntries(
      filteredData.map((d) => [
        d.type,
        { label: TYPE_LABELS[d.type] ?? d.type, color: TYPE_COLORS[d.type] ?? "#94a3b8" },
      ]),
    ),
  } satisfies ChartConfig;

  const hasData = filteredData.some((d) => d.revenue > 0);
  const rangeLabel =
    timeRange === "90d" ? "3 months" : timeRange === "30d" ? "30 days" : "7 days";

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Sales by Product Type</CardTitle>
          <CardDescription>Revenue share across product types (last {rangeLabel})</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
            <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
            <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {hasData ? (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatPrice(Number(value), "JPY")}
                    />
                  }
                />
                <Pie
                  data={filteredData}
                  dataKey="revenue"
                  nameKey="type"
                  innerRadius={60}
                  strokeWidth={2}
                >
                  {filteredData.map((d) => (
                    <Cell key={d.type} fill={`var(--color-${d.type})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 pt-3">
              {filteredData.map((d) => (
                <div key={d.type} className="flex items-center gap-1.5 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-[2px]"
                    style={{ backgroundColor: TYPE_COLORS[d.type] ?? "#94a3b8" }}
                  />
                  {TYPE_LABELS[d.type] ?? d.type}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No sales data
          </p>
        )}
      </CardContent>
    </Card>
  );
}
