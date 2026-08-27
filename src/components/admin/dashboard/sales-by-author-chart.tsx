"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

const chartConfig = {
  revenue: { label: "Revenue", color: "#6366f1" },
} satisfies ChartConfig;

export function SalesByAuthorChart({
  data,
  dayData,
  allDays,
}: {
  data: { id: string; name: string; revenue: number }[];
  dayData: { date: string; authorId: string; authorName: string; revenue: number }[];
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

    const byAuthor = new Map<string, { id: string; name: string; revenue: number }>();
    for (const entry of dayData) {
      const date = new Date(entry.date);
      if (date >= startDate) {
        const existing = byAuthor.get(entry.authorId) ?? { id: entry.authorId, name: entry.authorName, revenue: 0 };
        existing.revenue += entry.revenue;
        byAuthor.set(entry.authorId, existing);
      }
    }
    return [...byAuthor.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [data, dayData, timeRange]);

  const hasData = filteredData.length > 0;
  const rangeLabel =
    timeRange === "90d" ? "3 months" : timeRange === "30d" ? "30 days" : "7 days";

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Sales by Author</CardTitle>
          <CardDescription>Top authors by revenue (last {rangeLabel})</CardDescription>
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
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatPrice(Number(value), "JPY")}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatPrice(Number(value), "JPY")}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No sales data
          </p>
        )}
      </CardContent>
    </Card>
  );
}
