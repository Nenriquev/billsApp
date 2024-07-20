import { Response, Request } from "express";
import Data from "../models/Data";
import Categories from "../models/Categories";
import { colors } from "../data/data";

const months: string[] = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const getData = async ({ req, res }: { req: Request; res: Response }) => {
  try {
    const data = await Data.find({}).populate("category").sort({ date: -1 });

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: error });
  }
};

const getCategories = async ({ req, res }: { req: Request; res: Response }) => {
  try {
    const data = await Categories.find({});

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: error });
  }
};

const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    await Data.findByIdAndUpdate(id, data);
    return res.status(200).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: error });
  }
};

const getAnalyticData = async (req: Request, res: Response) => {
  const { category, from, to } = req.query as { category: string; from: string; to: string };
  let dataset: any = {};

  if (!from || !to) {
    throw new Error("Both 'from' and 'to' dates must be provided");
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  try {
    const categoryId = await Categories.findOne({ category });
    const data = await Data.find({
      category: categoryId?._id,
      date: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).populate("category");

    const total = await Data.aggregate([
      {
        $match: {
          category: categoryId?._id,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalValue: { $sum: "$value" },
        },
      },
    ]);

    if (category === "Supermercados" || category === "Seguro") {
      const dimentions: string[] = [];
      const source: any = [];
      const monthData: { [month: string]: { [seriesName: string]: number } } = {};

      data.forEach((transaction: any) => {
        const date = new Date(transaction.date);
        const month = months[date.getMonth()];

        if (!monthData[month]) {
          monthData[month] = {};
        }

        const seriesName = transaction.concept;

        if (monthData[month][seriesName]) {
          monthData[month][seriesName] = monthData[month][seriesName] + transaction.value;
        } else {
          monthData[month][seriesName] = transaction.value;
        }

        if (!dimentions.includes(seriesName)) {
          dimentions.push(seriesName);
        }
      });

      months.forEach((month) => {
        if (monthData[month] && Object.keys(monthData[month]).length > 0) {
          const monthEntry: any = { month };

          dimentions.forEach((dim) => {
            if (monthData[month][dim] && dim !== "month") {
              monthEntry[dim] = monthData[month][dim];
            } else if (dim !== "month") {
              monthEntry[dim] = null;
            }
          });

          source.push(monthEntry);
        }
      });

      dataset = {
        legend: {
          show: true,
        },
        dataset: {
          dimentions: ["month", ...dimentions],
          source: source,
        },
        series: dimentions.map((item: any) => {
          if (item !== "month") {
            return {
              type: "bar",
              stack: "total",
              color: colors[item as string] || "",
            };
          }
        }),
        xAxis: { type: "category", data: months },
      };
    } else if (categoryId && categoryId?.subcategories?.length > 0) {
      const dimentions: string[] = [];
      const source: any = [];
      const monthData: { [month: string]: { [seriesName: string]: number } } = {};

      data.forEach((transaction: any) => {
        const date = new Date(transaction.date);
        const month = months[date.getMonth()];

        if (!monthData[month]) {
          monthData[month] = {};
        }

        const seriesName = transaction.subcategory;

        if (monthData[month][seriesName]) {
          monthData[month][seriesName] = monthData[month][seriesName] + transaction.value;
        } else {
          monthData[month][seriesName] = transaction.value;
        }

        if (!dimentions.includes(seriesName)) {
          dimentions.push(seriesName);
        }
      });

      months.forEach((month) => {
        if (monthData[month] && Object.keys(monthData[month]).length > 0) {
          const monthEntry: any = { month };

          dimentions.forEach((dim) => {
            if (monthData[month][dim] && dim !== "month") {
              monthEntry[dim] = monthData[month][dim];
            } else if (dim !== "month") {
              monthEntry[dim] = null;
            }
          });

          source.push(monthEntry);
        }
      });

      dataset = {
        legend: {
          show: true,
        },
        dataset: {
          dimentions: ["month", ...dimentions],
          source: source,
        },
        series: dimentions.map((item: any, index: number) => {
          if (item !== "month") {
            return {
              type: "bar",
              stack: "total", 
              color: colors[item as string] || "",
            };
          }
        }),
        xAxis: { type: "category", data: months },
      };
    } else if (category === "Otra categoría") {
      const groupedData = data.reduce((acc, transaction) => {
        const { concept, value } = transaction;
        if (!acc[concept as string]) {
          acc[concept as string] = 0;
        }
        acc[concept as string] += value ?? 0;
        return acc;
      }, {} as Record<string, number>);

      const concepts = Object.keys(groupedData);

      const colors = ["#5470C6", "#91CC75", "#EE6666", "#FAC858", "#73C0DE", "#3BA272", "#FC8452", "#9A60B4", "#EA7CCC"];

      const seriesData = concepts.map((concept, index) => ({
        name: concept,
        value: groupedData[concept],
        itemStyle: {
          color: colors[index % colors.length],
        },
      }));

      dataset = {
        legend: {
          show: true,
          type: "scroll",
          orient: "horizontal",
          top: 10,
          data: concepts,
        },
        xAxis: {
          type: "category",
          data: concepts,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params: any) {
            const tooltipItems = params.map((param: any) => {
              return `${param.seriesName}: ${param.value}€`;
            });
            return tooltipItems.join("<br/>");
          },
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            start: 0,
            end: 100,
          },
        ],
        series: [
          {
            type: "bar",
            data: seriesData,
          },
        ],
      };
    } else {
      const dimensions: string[] = ["month", "Factura 1"];
      const source: any[] = [];
      const series: { type: string; stack: string; name: string }[] = [{ name: "Factura 1", type: "bar", stack: "total" }];

      const monthData: { [month: string]: { [seriesName: string]: number } } = {};

      data.forEach((transaction: any) => {
        const date = new Date(transaction.date);
        const month = months[date.getMonth()];

        if (!monthData[month]) {
          monthData[month] = {};
        }

        const seriesName = `Factura ${Object.keys(monthData[month]).length + 1}`;

        monthData[month][seriesName] = transaction.value;

        if (!dimensions.includes(seriesName)) {
          dimensions.push(seriesName);
          series.push({ name: seriesName, type: "bar", stack: "total" });
        }
      });

      months.forEach((month) => {
        if (monthData[month] && Object.keys(monthData[month]).length > 0) {
          const monthEntry: any = { month };

          dimensions.forEach((dim) => {
            if (monthData[month][dim] && dim !== "month") {
              monthEntry[dim] = monthData[month][dim];
            } else if (dim !== "month") {
              monthEntry[dim] = null;
            }
          });

          source.push(monthEntry);
        }
      });

      dataset = {
        legend: {
          show: true,
        },
        dataset: {
          dimentions: dimensions,
          source: source,
        },
        series: series,
        xAxis: { type: "category", data: months },
      };
    }

    return res.status(200).json({ data: dataset, total: total.length > 0 ? Number(total[0].totalValue.toFixed(2)) : 0 });
  } catch (error) {
    console.log(error);
  }
};

export { getAnalyticData, getData, updateTransaction, getCategories };
