import { Pembayaran } from "../models/pembayaranModel.js";
import { Polis } from "../models/polisModel.js";

// Membuat pembayaran baru (Status awal: menunggu konfirmasi)
export const createPembayaran = async (req, res) => {
  try {
    const { policyId, amount, method } = req.body;

    const pembayaran = await Pembayaran.create({
      policyId,
      amount,
      method,
      status: "menunggu_konfirmasi"
    });

    res.status(201).json({
      message: "Pembayaran berhasil diajukan. Mohon tunggu konfirmasi dari Admin.",
      pembayaran,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mengajukan perpanjangan polis
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
      status: "menunggu_konfirmasi"
    });

    res.status(200).json({
      message: "Permintaan perpanjangan diajukan. Polis akan diperpanjang setelah dikonfirmasi Admin.",
      pembayaran,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Konfirmasi Pembayaran oleh Admin
export const confirmPembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; 

    const pembayaran = await Pembayaran.findById(id).populate("policyId");
    if (!pembayaran) return res.status(404).json({ message: "Pembayaran tidak ditemukan" });

    if (pembayaran.status === "berhasil") {
      return res.status(400).json({ message: "Pembayaran ini sudah dikonfirmasi sebelumnya." });
    }

    if (action === "tolak") {
      pembayaran.status = "gagal";
      await pembayaran.save();
      return res.status(200).json({ message: "Pembayaran ditolak.", pembayaran });
    }

    pembayaran.status = "berhasil";
    await pembayaran.save();

    const polis = pembayaran.policyId;
    if (polis) {
      if (pembayaran.type === "perpanjangan") {
        const currentEnding = new Date(polis.endingDate);
        const newEnding = new Date(currentEnding.setMonth(currentEnding.getMonth() + 1));
        polis.endingDate = newEnding;
      }
      polis.status = "aktif";
      await polis.save();
    }

    res.status(200).json({
      message: "Pembayaran dikonfirmasi. Status polis telah diperbarui.",
      pembayaran,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPembayaran = async (req, res) => {
  try {
    const { search } = req.query;

    let pembayaran;

    if (search) {
      // Logika pencarian: Cari user dengan nama yang cocok
      pembayaran = await Pembayaran.find()
        .populate({
          path: "policyId",
          populate: {
            path: "userId",
            select: "name email",
            match: { name: { $regex: search, $options: "i" } }, // Filter nama user
          },
        })
        .sort({ createdAt: -1 });

      // Filter data yang policyId / userId-nya null karena match di atas
      pembayaran = pembayaran.filter(
        (p) => p.policyId && p.policyId.userId !== null
      ).slice(0, 20);

      if (pembayaran.length === 0) {
        return res.status(200).json([]);
      }

      return res.status(200).json(pembayaran);
    }

    // Jika tidak ada search, ambil semua
    const data = await Pembayaran.find().populate({
      path: "policyId",
      populate: { path: "userId", select: "name email" },
    }).sort({ createdAt: -1 });

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
    const userId = req.user.userId;

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