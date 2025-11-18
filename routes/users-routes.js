const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const router = express.Router();
router.get("/", usersController.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("fname").notEmpty(),

    check("lname").notEmpty(),

    check("email").normalizeEmail().isEmail(),

    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;
