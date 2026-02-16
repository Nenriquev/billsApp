import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { MonthlyTrend } from "../../types";

interface TrendChartProps {
  data: MonthlyTrend[];
}

function TrendChart({ data }: TrendChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    if (data.length === 0) return;

    const chart = echarts.init(ref.current);
    chartInstance.current = chart;

    chart.setOption({
      tooltip: {
        trigger: "axis",
        formatter: (params: { name: string; value: number }[]) => {
          const p = params[0];
          return `<b>${p.name}</b><br/>${p.value.toFixed(2)} €`;
        },
      },
      grid: {
        left: 50,
        right: 20,
        top: 20,
        bottom: 30,
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.month),
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
      series: [
        {
          type: "line",
          data: data.map((d) => d.total),
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { width: 3, color: "#6366f1" },
          itemStyle: { color: "#6366f1", borderWidth: 2, borderColor: "#fff" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(99, 102, 241, 0.25)" },
              { offset: 1, color: "rgba(99, 102, 241, 0.02)" },
            ]),
          },
        },
      ],
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

  return <div ref={ref} style={{ width: "100%", height: 300 }} />;
}

export default TrendChart;
