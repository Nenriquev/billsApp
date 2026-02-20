import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import Loader from "./Loader";
import { ChartDataset } from "../types";

interface BarChartProps {
  data: ChartDataset | Record<string, never>;
  loading: boolean;
  id: string;
}

function BarChart({ data, loading, id }: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (loading || !chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const updateOptions = () => {
      if (!chartRef.current || !chartInstance.current) return;
      const chart = chartInstance.current;
      const isMobile = window.innerWidth < 768;

      const hasData = data && Object.keys(data).length > 0;
      if (!hasData) {
        chart.clear();
        return;
      }

      // We use 'any' here because data might contain complex ECharts options not fully typed in our local interface
      const chartData = data as any;

      const option: echarts.EChartsOption = {
        ...chartData,
        grid: {
          left: isMobile ? "2%" : "3%",
          right: isMobile ? "2%" : "4%",
          bottom: isMobile ? "2%" : "3%",
          top: isMobile ? 55 : 60,
          containLabel: true,
          ...(chartData.grid || {})
        },
        legend: {
          show: !isMobile,
          top: 10,
          textStyle: { fontSize: 13 },
          ...(chartData.legend || {})
        },
        yAxis: {
          type: "value",
          axisLabel: {
            fontSize: isMobile ? 11 : 12,
            verticalAlign: "middle",
            formatter: (value: number) => `${value.toFixed(0)}€`,
          },
          splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
          ...(chartData.yAxis || {})
        },
        tooltip: {
          trigger: "item",
          formatter: (params: unknown) => {
            const p = params as any;
            if (typeof p.value === "number") {
              return `<b>${p.name}</b><br/>${p.value.toFixed(2)} €`;
            }
            const val = p.data?.[p.seriesName];
            return `<span>${p.seriesName}</span><br/><b>${val?.toFixed(2) ?? 0} €</b>`;
          },
          ...(chartData.tooltip || {})
        },
      };

      const series = chartData.series || [];
      const source = chartData.dataset?.source || [];
      const hasValues = series.some((s: any) => s.data?.some((v: any) => v !== 0 && v !== null)) || 
                       source.some((obj: any) => Object.values(obj).some(v => typeof v === 'number' && v !== 0));

      if (!hasValues) {
        chart.clear();
      } else {
        chart.setOption(option, true);
      }
    };

    updateOptions();

    const resizeObserver = new ResizeObserver(() => {
        chartInstance.current?.resize();
        updateOptions();
    });
    
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, loading]);

  useEffect(() => {
    return () => {
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  const chartData = (data as any) || {};
  const series = chartData.series || [];
  const source = chartData.dataset?.source || [];

  const hasValues = series.some((s: any) => s.data?.some((v: any) => v !== 0 && v !== null)) || 
                   source.some((obj: any) => Object.values(obj).some(v => typeof v === 'number' && v !== 0));

  const hasNoData = !loading && (Object.keys(chartData).length === 0 || !hasValues);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "var(--bg-card)",
            zIndex: 11
          }}
        >
          <Loader />
        </div>
      )}
      <div
        id={id}
        ref={chartRef}
        className="chart"
        style={{ width: "100%", height: "100%" }}
      />
      {hasNoData && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#94a3b8",
            fontSize: "1rem",
            fontWeight: 500,
            pointerEvents: "none",
            zIndex: 10,
            background: "transparent"
          }}
        >
          Sin datos
        </div>
      )}
    </div>
  );
}

export default BarChart;
