import mongoose from "mongoose";

const polisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  policyNumber: {
    type: String,
    unique: true,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["aktif", "kedaluwarsa", "dibatalkan"],
    default: "aktif",
  },
}, {timestamps: true}
);

export const Polis = mongoose.model("Polis", polisSchema);
