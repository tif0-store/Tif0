import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Local server is disabled. Production orders are handled by /api/orders.js on Vercel.",
  });
});

app.post("/api/orders", (req, res) => {
  res.status(410).json({
    success: false,
    message:
      "Local backend is disabled. Use the Vercel /api/orders endpoint instead.",
  });
});

app.listen(PORT, () => {
  console.log(`Local placeholder server running on http://localhost:${PORT}`);
});
