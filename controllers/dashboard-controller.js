import { Category } from "../models/category.js";
import { Expense } from "../models/expense.js";
import { Types } from "mongoose";

const getMonthRange = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
};

export const getDashboardSummary = async (req, res) => {
  try {
    const userObjectId = new Types.ObjectId(req.user.id);
    const monthKey = String(req.query.month);

    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const { start, end } = getMonthRange(monthKey);

    const categories = await Category.find({
      userId: userObjectId,
      monthKey,
    }).lean();

    const totals = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalMap = new Map(totals.map((t) => [t._id.toString(), t.total]));

    const byCategory = categories.map((c) => ({
      categoryId: c._id.toString(),
      name: c.name,
      total: totalMap.get(c._id.toString()) ?? 0,
    }));

    const monthTotal = byCategory.reduce((sum, c) => sum + c.total, 0);

    res.json({ month: monthKey, monthTotal, byCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
};
