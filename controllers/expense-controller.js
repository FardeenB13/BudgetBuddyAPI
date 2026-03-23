import { Expense } from "../models/expense.js";
import { Types } from "mongoose";

const getMonthRange = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
};

export const getExpenses = async (req, res) => {
  try {
    const userObjectId = new Types.ObjectId(req.user.id);
    const monthKey = String(req.query.month);
    const categoryId = req.query.categoryId;

    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const { start, end } = getMonthRange(monthKey);

    const filter = {
      userId: userObjectId,
      date: { $gte: start, $lt: end },
    };

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

    res.json(
      expenses.map((e) => ({
        id: e._id.toString(),
        categoryId: e.categoryId.toString(),
        amount: e.amount,
        description: e.description,
        date: e.date,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

export const createExpense = async (req, res) => {
  try {
    const userObjectId = new Types.ObjectId(req.user.id);
    const { categoryId, amount, date, description } = req.body;

    if (!categoryId || amount <= 0) {
      return res.status(400).json({ message: "Invalid expense data" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const expense = await Expense.create({
      userId: userObjectId,
      categoryId: new Types.ObjectId(categoryId),
      amount,
      date: parsedDate,
      description: description ?? "",
    });

    res.status(201).json({ id: expense._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create expense" });
  }
};
