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

    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    const hasData = data && Object.keys(data).length > 0;
    if (!hasData) return;

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const option: echarts.EChartsOption = {
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => `${value.toFixed(0)}€`,
        },
        splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
      },
      tooltip: {
        trigger: "item",
        formatter: (params: unknown) => {
          const p = params as {
            seriesName: string;
            name: string;
            value: number | Record<string, number>;
            data: Record<string, number>;
          };
          if (typeof p.value === "number") {
            return `<b>${p.name}</b><br/>${p.value.toFixed(2)} €`;
          }
          const val = p.data?.[p.seriesName];
          return `<span>${p.seriesName}</span><br/><b>${val?.toFixed(2) ?? 0} €</b>`;
        },
      },
      ...data,
    };

    chart.setOption(option, true);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: loading ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader />
      </div>
      <div
        id={id}
        ref={chartRef}
        className="chart"
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
}

export default BarChart;
