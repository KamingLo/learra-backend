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
  premium:{
    type: Number,
    required:true,
  },
  status: {
    type: String,
    enum: ["aktif", "kedaluwarsa"],
    default: "aktif",
  },
  detail:{
    
  },
}, {timestamps: true}
);

export const Polis = mongoose.model("Polis", polisSchema);
