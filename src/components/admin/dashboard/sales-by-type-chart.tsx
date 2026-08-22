"use client";

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

export function SalesByTypeChart({ data }: { data: SalesByTypeDatum[] }) {
  const chartConfig = {
    revenue: { label: "Revenue" },
    ...Object.fromEntries(
      data.map((d) => [
        d.type,
        { label: TYPE_LABELS[d.type] ?? d.type, color: TYPE_COLORS[d.type] ?? "#94a3b8" },
      ]),
    ),
  } satisfies ChartConfig;

  const hasData = data.some((d) => d.revenue > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Product Type</CardTitle>
        <CardDescription>Revenue share across product types (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
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
                  data={data}
                  dataKey="revenue"
                  nameKey="type"
                  innerRadius={60}
                  strokeWidth={2}
                >
                  {data.map((d) => (
                    <Cell key={d.type} fill={`var(--color-${d.type})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 pt-3">
              {data.map((d) => (
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
