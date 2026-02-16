import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { CategorySummary } from "../../types";

interface DonutChartProps {
  data: CategorySummary[];
}

function DonutChart({ data }: DonutChartProps) {
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

    const total = data.reduce((s, d) => s + d.total, 0);

    chart.setOption({
      tooltip: {
        trigger: "item",
        formatter: (params: { name: string; value: number; percent: number }) =>
          `<b>${params.name}</b><br/>${params.value.toFixed(2)} € (${params.percent}%)`,
      },
      legend: {
        type: "scroll",
        orient: "vertical",
        right: 10,
        top: "middle",
        textStyle: { fontSize: 12, color: "#64748b" },
      },
      series: [
        {
          type: "pie",
          radius: ["50%", "78%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "center",
            formatter: () => `{total|${total.toFixed(0)} €}\n{label|Total año}`,
            rich: {
              total: { fontSize: 20, fontWeight: "bold" as const, color: "#0f172a", lineHeight: 30 },
              label: { fontSize: 12, color: "#94a3b8" },
            },
          },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: "bold" },
          },
          data: data.map((d) => ({
            name: d.category,
            value: d.total,
            itemStyle: { color: d.color },
          })),
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

  return <div ref={ref} style={{ width: "100%", height: 320 }} />;
}

export default DonutChart;
