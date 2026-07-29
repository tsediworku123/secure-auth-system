require("dotenv").config();

const app = require("./app");
const db = require("./config/db");

const PORT = 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    const connection = await db.getConnection();

    console.log("MySQL database connected successfully!");

    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
});