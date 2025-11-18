const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

// --- GET USERS ---
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new Error("Fetching users failed, please try again later.");
    error.code = 500;
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

// --- SIGNUP ---
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid inputs passed, please check your data.");
    error.code = 422;
    return next(error);
  }

  const { fname, lname, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new Error("Signing up failed, please try again later.");
    error.code = 500;
    return next(error);
  }

  if (existingUser) {
    const error = new Error("User exists already, please login instead.");
    error.code = 422;
    return next(error);
  }

  // Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new Error("Could not create user, password hashing failed.");
    error.code = 500;
    return next(error);
  }

  const createdUser = new User({
    fname,
    lname,
    email,
    password: hashedPassword,
    image: req.file?.path || undefined,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new Error("Signing up failed (could not save user).");
    error.code = 500;
    return next(error);
  }

  // Generate JWT using .env secret
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Error("Signing up failed (token creation).");
    error.code = 500;
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    fname: createdUser.fname,
    lname: createdUser.lname,
    token,
  });
};


// --- LOGIN ---
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new Error("Logging in failed, please try again later.");
    error.code = 500;
    return next(error);
  }

  if (!existingUser) {
    const error = new Error("Invalid credentials, could not log you in.");
    error.code = 401;
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new Error("Could not verify password.");
    error.code = 500;
    return next(error);
  }

  if (!isValidPassword) {
    const error = new Error("Invalid credentials, could not log you in.");
    error.code = 401;
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Error("Logging in failed, please try again.");
    error.code = 500;
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    fname: existingUser.fname,
    lname: existingUser.lname,
    token,
  });
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
