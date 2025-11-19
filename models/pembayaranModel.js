import mongoose from "mongoose";

const pembayaranSchema = new mongoose.Schema({
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Polis", // <--- PERBAIKAN: Ubah dari "Policy" ke "Polis"
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
  type: { // Tambahan untuk membedakan pembayaran awal/perpanjangan
    type: String,
    enum: ["pembayaran_awal", "perpanjangan"],
    default: "pembayaran_awal"
  },
  status: {
    type: String,
    // Tambahkan status 'menunggu_konfirmasi' agar sesuai controller
    enum: ["menunggu_konfirmasi", "berhasil", "gagal"], 
    default: "menunggu_konfirmasi",
  },
}, {timestamps: true}
);

export const Pembayaran = mongoose.model("Pembayaran", pembayaranSchema);