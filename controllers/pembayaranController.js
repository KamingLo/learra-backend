import { Pembayaran } from "../models/pembayaranModel.js";
import QRCode from "qrcode";

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

export const perpanjangPolis = async (req, res) => {
  try {
    const { policyId, amount, method } = req.body;

    const polis = await Polis.findById(policyId);
    if (!polis) {
      return res.status(404).json({ message: "Polis tidak ditemukan" });
    }

    const pembayaran = await Pembayaran.create({
      policyId,
      amount,
      method,
      type: "perpanjangan",
    });

    const qrUrl = `${req.protocol}://${req.get("host")}/api/pembayaran/scan/${pembayaran._id}`;
    const qrImage = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: "H",
      width: 300,
    });

    const currentEnding = new Date(polis.endingDate);
    const newEnding = new Date(currentEnding.setMonth(currentEnding.getMonth() + 1));
    polis.endingDate = newEnding;

    await polis.save();

    res.status(200).json({
      message: "Polis berhasil diperpanjang selama 1 bulan",
      pembayaran,
      qrUrl,
      qrImage,
      newEndingDate: polis.endingDate,
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
    const { userName } = req.query;

    let pembayaran;

    if (userName) {
      pembayaran = await Pembayaran.find()
        .populate({
          path: "policyId",
          populate: {
            path: "userId",
            select: "name email",
            match: { name: { $regex: userName, $options: "i" } }, // filter nama user
          },
        });

      pembayaran = pembayaran.filter(
        (p) => p.policyId && p.policyId.userId !== null
      );

      if (pembayaran.length === 0) {
        return res.status(404).json({
          message: "Tidak ada pembayaran dengan nama user tersebut.",
        });
      }

      return res.status(200).json(pembayaran);
    }

    const data = await Pembayaran.find().populate({
      path: "policyId",
      populate: { path: "userId", select: "name email" },
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching pembayaran:", error.message);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data pembayaran." });
  }
};

export const getPembayaranByUser = async (req, res) => {
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
