import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import Loader from "./Loader";
import useData from "../hooks/useData";

function BarChart({ data, loading, colors, id }: { data: Array<any>; loading: boolean; colors: string[]; id: string }) {
  const chartRef = useRef(null);
  const { setDate } = useData();

  useEffect(() => {
    if (loading) return;

    const chartDom = chartRef.current;
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);

    const groupedData: Array<any> = Array.from({ length: 12 }, () => []);

    data.forEach((item) => {
      const month = new Date(item.date).getMonth();
      groupedData[month].push({ value: item.value, date: item.date });
    });

    const series: Array<any> = [];
    groupedData.forEach((monthData, monthIndex) => {
      monthData.forEach((item: any, stackIndex: number) => {
        if (!series[stackIndex]) {
          series[stackIndex] = {
            name: `Factura ${stackIndex + 1}`,
            type: "bar",
            stack: "total",
            data: Array(12).fill(0),
            itemStyle: {
              color: colors[stackIndex % colors.length],
            },
          };
        }
        series[stackIndex].data[monthIndex] = {
          value: item.value,
          date: item.date,
        };
      });
    });

    const option = {
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params: any) {
          if (params.value > 0) {
            return `<span>${setDate(params.data.date)}</span></br><b>${params.value.toFixed(2)} €</b>`;
          }
          return "";
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: function (value: any) {
            return `${value.toFixed(1)}€`;
          },
        },
      },
      series: series,
    };

    myChart.setOption(option);

    return () => {
      if (myChart && !myChart.isDisposed()) {
        myChart.dispose();
      }
    };
  }, [data, loading]);

  return (
    <div id={id} ref={chartRef} className="chart">
      {loading && (
        <div id={`loading-${id}`} style={{ width: "100%", height: "100%" }} className="loading">
          <Loader />
        </div>
      )}
    </div>
  );
}

export default BarChart;
