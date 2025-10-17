import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Simple route
app.get("/", (req, res) => {
  res.send("Server is live! 🚀");
});

// Jalankan server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
