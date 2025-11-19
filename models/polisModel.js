import mongoose from "mongoose";

const polisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produk", // <--- WAJIB "Produk" (Sesuai nama di produkModel.js)
    required: true,
  },
  policyNumber: {
    type: String,
    unique: true,
    required: true,
  },
  premium: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  endingDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["inaktif", "aktif", "dibatalkan"],
    default: "inaktif",
  },
  detail: {
    kesehatan: {
      merokok: { type: Boolean },
      hipertensi: { type: Boolean },
      diabetes: { type: Boolean },
    },
    jiwa: {
      jumlahTanggungan: { type: Number },
      statusPernikahan: { type: String },
    },
    kendaraan: {
      merek: { type: String },
      jenisKendaraan: { type: String },
      nomorKendaraan: { type: String },
      hargaKendaraan: { type: Number },
      nomorRangka: { type: String },
      nomorMesin: { type: String },
      namaPemilik: { type: String },
      umurKendaraan: { type: Date },
    },
  },
}, { timestamps: true });

export const Polis = mongoose.model("Polis", polisSchema);