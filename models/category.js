import { Schema, model, Types } from "mongoose";

const CategorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    // monthKey = "YYYY-MM" (ex: "2025-12")
    monthKey: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, monthKey: 1, name: 1 }, { unique: true });

export const Category = model("Category", CategorySchema);
