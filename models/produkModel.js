import mongoose from "mongoose";

const produkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  premiDasar:{
    type: Number,
    required: true,
    min: 0,
  },
  tipe: {
    type: String,
    required: true,
    enum: ["jiwa", "kesehatan", "pendidikan"],
  },
}, {timestamps: true}
);

export const Produk = mongoose.model("Produk", produkSchema);
