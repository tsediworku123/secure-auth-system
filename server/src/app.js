const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // ADD THIS

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Support both Vite ports
  credentials: true, // allows cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // ADD THIS

app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running",
  });
});

app.use("/api/auth", authRoutes);

module.exports = app;