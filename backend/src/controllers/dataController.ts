import { Response, Request } from "express";
import Data from "../models/Data";

const getData = async (req: Request, res: Response) => {
  const { category, from, to } = req.query as { category: string; from: string; to: string };

  if (!from || !to) {
    throw new Error("Both 'from' and 'to' dates must be provided");
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  try {
    const data = await Data.find({
      category,
      date: {
        $gte: fromDate,
        $lte: toDate,
      },
    });

    const total = await Data.aggregate([
      {
        $match: {
          category: category,
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

    return res.status(200).json({ data: data, total: total.length > 0 ? Number(total[0].totalValue.toFixed(2)) : 0 });
  } catch (error) {
    console.log(error);
  }
};

export { getData };
