import { Pembayaran } from "../models/Pembayaran.js";
import QRCode from "qrcode";

// Create pembayaran + generate QR
export const createPembayaran = async (req, res) => {
  try {
    const { policyId, amount, method } = req.body;

    const pembayaran = await Pembayaran.create({
      policyId,
      amount,
      method,
    });

    const qrUrl = `${req.protocol}://${req.get("host")}/api/pembayaran/scan/${pembayaran._id}`;

    const qrImage = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: "H",
      width: 300,
    });

    res.status(201).json({
      message: "Pembayaran dibuat, silakan scan QR untuk menyelesaikan pembayaran",
      pembayaran,
      qrUrl,
      qrImage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const scanPembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    const pembayaran = await Pembayaran.findById(id).populate("policyId");
    if (!pembayaran) return res.status(404).json({ message: "Pembayaran tidak ditemukan" });

    pembayaran.status = "berhasil";
    await pembayaran.save();

    const polis = pembayaran.policyId;
    if (polis) {
      polis.status = "aktif";
      await polis.save();
    }

    res.status(200).json({
      message: "Pembayaran berhasil, polis sekarang aktif",
      pembayaran,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPembayaran = async (req, res) => {
  try {
    const data = await Pembayaran.find().populate("policyId");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPembayaranUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const polisUser = await Polis.find({ userId }).select("_id");
    const polisIds = polisUser.map(p => p._id);

    const pembayaran = await Pembayaran.find({ policyId: { $in: polisIds } })
      .populate({
        path: "policyId",
        populate: { path: "productId" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Daftar pembayaran user",
      pembayaran,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deletePembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const pembayaran = await Pembayaran.findByIdAndDelete(id);
    if (!pembayaran) return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    res.status(200).json({ message: "Pembayaran dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
