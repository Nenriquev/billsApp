import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface CategoryBarChartProps {
  data: {
    months: string[];
    series: { name: string; data: number[]; color: string }[];
  };
}

function CategoryBarChart({ data }: CategoryBarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    if (data.months.length === 0) return;

    const chart = echarts.init(ref.current);
    chartInstance.current = chart;

    chart.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: { seriesName: string; value: number; color: string }[]) => {
          const items = params
            .filter((p) => p.value > 0)
            .sort((a, b) => b.value - a.value)
            .map(
              (p) =>
                `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px"></span>${p.seriesName}: <b>${p.value.toFixed(2)} €</b>`
            );
          return items.join("<br/>");
        },
      },
      legend: {
        type: "scroll",
        bottom: 0,
        textStyle: { fontSize: 11, color: "#64748b" },
      },
      grid: {
        left: 50,
        right: 20,
        top: 20,
        bottom: 50,
      },
      xAxis: {
        type: "category",
        data: data.months,
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { color: "#64748b", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
          formatter: (v: number) => `${v.toFixed(0)} €`,
        },
        splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
      },
      series: data.series.map((s) => ({
        name: s.name,
        type: "bar",
        stack: "total",
        data: s.data,
        itemStyle: {
          color: s.color,
          borderRadius: [2, 2, 0, 0],
        },
        emphasis: { focus: "series" },
      })),
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data]);

  useEffect(() => {
    return () => {
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return <div ref={ref} style={{ width: "100%", height: 350 }} />;
}

export default CategoryBarChart;
