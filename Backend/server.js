const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 8080;

const connectDB = require("./config/db");
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);