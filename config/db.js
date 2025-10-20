import mongoose from "mongoose";
import env from "dotenv";

env.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export const attachDb = (req, res, next) => {
  req.db = { User };
  next();
};
