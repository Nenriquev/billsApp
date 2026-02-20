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

    const updateOptions = () => {
      if (!ref.current || !chartInstance.current) return;
      const chart = chartInstance.current;
      const isMobile = window.innerWidth < 768;

      const hasValues = data.series.some(s => s.data.some(v => v > 0));

      if (!hasValues) {
          chart.clear();
          return;
      }

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
          show: !isMobile,
          type: "scroll",
          bottom: 0,
          textStyle: { fontSize: 11, color: "#64748b" },
        },
        grid: {
          left: isMobile ? 40 : 50,
          right: 20,
          top: isMobile ? 55 : 20,
          bottom: isMobile ? 40 : 50,
        },
        xAxis: {
          type: "category",
          data: data.months,
          axisLine: { lineStyle: { color: "#e2e8f0" } },
          axisLabel: { color: "#64748b", fontSize: 11, hideOverlap: true },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#64748b",
            fontSize: isMobile ? 11 : 12,
            verticalAlign: "middle",
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
      }, true);
    };

    updateOptions();

    const resizeObserver = new ResizeObserver(() => {
        chartInstance.current?.resize();
        updateOptions();
    });
    
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
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

  const hasNoData = !data || data.months.length === 0 || !data.series.some(s => s.data.some(v => v !== 0));

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {hasNoData && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#94a3b8",
            fontSize: "1rem",
            fontWeight: 500,
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          Sin datos
        </div>
      )}
      <div ref={ref} style={{ width: "100%", height: "100%", minHeight: 350 }} />
    </div>
  );
}

export default CategoryBarChart;
