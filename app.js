import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import authMiddleware from "./middleware/auth-middleware.js";
import usersRoutes from "./routes/users-routes.js";
import categoryRoutes from "./routes/category-routes.js";
import expenseRoutes from "./routes/expense-routes.js";
import dashboardRoutes from "./routes/dashboard-routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", usersRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/expenses", authMiddleware, expenseRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(error.code || 500).json({
    message: error.message || "Unknown error occurred",
  });
});

// DB + Server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(5001, () => {
      console.log(" Server running on http://localhost:5001");
    });
  })
  .catch((err) => {
    console.error(" Database connection failed:", err);
  });
