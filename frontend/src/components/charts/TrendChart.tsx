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

    const updateOptions = () => {
      if (!ref.current) return;
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(ref.current);
      }
      const chart = chartInstance.current;
      const isMobile = window.innerWidth < 768;

      const hasValues = data.some(d => d.total !== 0);

      if (!hasValues) {
          chart.clear();
          return;
      }

      chart.setOption({
        tooltip: {
          trigger: "axis",
          formatter: (params: { name: string; value: number }[]) => {
            const p = params[0];
            return `<b>${p.name}</b><br/>${p.value.toFixed(2)} €`;
          },
        },
        grid: {
          left: isMobile ? 40 : 50,
          right: 20,
          top: isMobile ? 55 : 20,
          bottom: 30,
        },
        xAxis: {
          type: "category",
          data: data.map((d) => d.month),
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

  const hasNoData = !data || data.length === 0 || data.every(d => d.total === 0);

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
      <div ref={ref} style={{ width: "100%", height: "100%", minHeight: 300 }} />
    </div>
  );
}

export default TrendChart;
