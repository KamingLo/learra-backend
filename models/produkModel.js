import mongoose from "mongoose";

const produkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  premium: {
    type: Number,
    required: true,
    min: 0,
  },
  coverage: {
    type: String, // misal: "Kesehatan", "Kendaraan", dll
    required: true,
  },
}, {timestamps: true}
);

export const Produk = mongoose.model("Produk", produkSchema);
