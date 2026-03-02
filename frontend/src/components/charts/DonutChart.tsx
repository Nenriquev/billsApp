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

    if (!chartInstance.current) {
        chartInstance.current = echarts.init(ref.current);
    }
    
    // The 'chart' variable here was unused, as 'updateOptions' declares its own 'chart'
    // Removed: const chart = chartInstance.current;
    const updateOptions = () => {
      if (!ref.current || !chartInstance.current) return;
      const chart = chartInstance.current;
      const isMobile = window.innerWidth < 768;

      const hasData = data && data.length > 0 && data.some(d => d.total > 0);
      const total = data.reduce((s, d) => s + d.total, 0);

      if (!hasData || total === 0) {
          chart.clear();
          return;
      }

      chart.setOption({
        tooltip: {
          trigger: "item",
          formatter: (params: { name: string; value: number; percent: number }) =>
            `<b>${params.name}</b><br/>${params.value.toFixed(2)} € (${params.percent}%)`,
        },
        legend: {
          show: !isMobile,
          type: "scroll",
          orient: "vertical",
          right: 10,
          top: "middle",
          textStyle: { fontSize: 12, color: "#64748b" },
        },
        series: [
          {
            type: "pie",
            radius: isMobile ? ["45%", "70%"] : ["50%", "78%"],
            center: isMobile ? ["50%", "55%"] : ["35%", "50%"],
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
                total: { fontSize: isMobile ? 16 : 20, fontWeight: "bold" as const, color: "#0f172a", lineHeight: 30 },
                label: { fontSize: isMobile ? 10 : 12, color: "#94a3b8" },
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

  const hasNoData = !data || data.length === 0 || data.reduce((s, d) => s + d.total, 0) === 0;

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
      <div ref={ref} style={{ width: "100%", height: "100%", minHeight: 320 }} />
    </div>
  );
}

export default DonutChart;
