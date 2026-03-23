import { Category } from "../models/category.js";
import { Types } from "mongoose";

export const getCategoriesByMonth = async (req, res) => {
  try {
    const userObjectId = new Types.ObjectId(req.user.id);
    const monthKey = String(req.query.month);

    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const categories = await Category.find({
      userId: userObjectId,
      monthKey,
    })
      .sort({ name: 1 })
      .lean();

    res.json(
      categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        monthKey: c.monthKey,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const userObjectId = new Types.ObjectId(req.user.id);
    const { name, monthKey } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name required" });
    }

    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const existing = await Category.findOne({
      userId: userObjectId,
      name: name.trim(),
      monthKey,
    });

    if (existing) {
      return res.json({
        id: existing._id.toString(),
        name: existing.name,
        monthKey: existing.monthKey,
      });
    }

    const category = await Category.create({
      userId: userObjectId,
      name: name.trim(),
      monthKey,
    });

    res.status(201).json({
      id: category._id.toString(),
      name: category.name,
      monthKey: category.monthKey,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create category" });
  }
};
