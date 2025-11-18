require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require("./routes/users-routes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", usersRoutes);

// Error Handling Middleware
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown error occurred." });
});

// Connect to DB & Start Server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(5001, () => {
      console.log("Database connected and server listening on port 5001");
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });
