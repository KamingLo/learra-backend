import mongoose from "mongoose";

const produkSchema = new mongoose.Schema({
  namaProduk: { // UBAH dari 'name' jadi 'namaProduk' agar cocok dengan controller search query
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
    // TAMBAHKAN "kendaraan"
    enum: ["jiwa", "kesehatan", "pendidikan", "kendaraan"], 
  },
}, {timestamps: true}
);

export const Produk = mongoose.model("Produk", produkSchema);