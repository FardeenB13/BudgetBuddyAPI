import express from "express";
import { check } from "express-validator";
import * as usersController from "../controllers/users-controllers.js";

const router = express.Router();
router.get("/", usersController.getUsers);

router.post(
  "/signup",
  [
    check("fname").notEmpty(),
    check("lname").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

export default router;
