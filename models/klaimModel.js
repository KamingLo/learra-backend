import mongoose from "mongoose";

const klaimSchema = new mongoose.Schema({
    polisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Polis",
        required: true,
    },
    namaRekening: {
        type: String,
        required: true,   // user wajib isi waktu claim
    },
    noRekening: {
        type: String,
        required: true,
    },
    jumlahKlaim: {
        type: Number,
        required: true,
    },
    tanggalKlaim: {
        type: Date,
        default: Date.now,
        required: true,
    },
    status:{
        type: String,
        enum: ["menunggu","diterima", "ditolak"],
        default: "menunggu",
        required: true
    },
    deskripsi:{
        type: String,
        required: true,
    }, 
}, {timestamps : true});

export const Klaim = mongoose.model("Klaim", klaimSchema);