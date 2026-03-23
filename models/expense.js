import { Schema, model } from "mongoose";

const ExpenseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    date: { type: Date, required: true, index: true }, // used for month filtering
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1, date: 1 });

export const Expense = model("Expense", ExpenseSchema);
