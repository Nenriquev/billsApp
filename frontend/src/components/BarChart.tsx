import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import Loader from "./Loader";
import useData from "../hooks/useData";

function BarChart({ data, loading, id }: { data: any; loading: boolean; id: string }) {
  const chartRef = useRef(null);
  const { formateDate } = useData();

  useEffect(() => {
    if (loading) return;

    const chartDom = chartRef.current;
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);

    const option: any = {
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: function (value: any) {
            return `${value.toFixed(0)}€`;
          },
        },
      },
      tooltip: {
        formatter: function (value: any) {
          console.log(value);
          const serie = value.seriesName;
          return `<span>${serie}</span></br>
          <b>${value.data[serie].toFixed(2)} €</b>`;
        },
      },
      ...data,
    };

    myChart.setOption(option);

    return () => {
      if (myChart && !myChart.isDisposed()) {
        myChart.dispose();
      }
    };
  }, [data, loading]);

  return (
    <>
      {loading && (
        <div id={`loading-${id}`} style={{ width: "100%", height: "100%" }} className="loading">
          <Loader />
        </div>
      )}

      <div id={id} ref={chartRef} className="chart"></div>
    </>
  );
}

export default BarChart;
