const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendError = require("../utils/sendError");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return sendError(res, 400, "VALIDATION_ERROR", "Name, email, and password are required");
    }

    if (name.length < 2) {
      return sendError(res, 400, "VALIDATION_ERROR", "Name must be at least 2 characters");
    }

    if (!emailRegex.test(email)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid email format");
    }

    if (password.length < 8) {
      return sendError(res, 400, "VALIDATION_ERROR", "Password must be at least 8 characters");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 409, "USER_EXISTS", "User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return sendError(res, 400, "VALIDATION_ERROR", "Email and password are required");
    }

    if (!emailRegex.test(email)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid email format");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Server error");
  }
};

module.exports = { registerUser, loginUser };
