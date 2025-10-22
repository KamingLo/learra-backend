import mongoose from "mongoose";

const pembayaranSchema = new mongoose.Schema({
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Policy",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["menunggu", "berhasil", "gagal"],
    default: "menunggu",
  },
}, {timestamps: true}
);

export const Pembayaran = mongoose.model("Pembayaran", pembayaranSchema);
