import { Response, Request } from "express";
import Data from "../models/Data";

const getData = async (req: Request, res: Response) => {
  const { category } = req.query;

  try {
    const data = await Data.find({
      category,
    });

    const total = await Data.aggregate([
      { $match: { category: category } },
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
