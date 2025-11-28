import { Klaim } from "../models/klaimModel.js";
import { Polis } from "../models/polisModel.js";

export const createKlaim = async (req, res) => {
  try {
    const { polisId, jumlahKlaim, deskripsi, namaRekening, noRekening } = req.body;

    if (!namaRekening || !noRekening) {
      return res.status(400).json({
        message: "Nama rekening dan nomor rekening wajib diisi.",
      });
    }

    const polis = await Polis.findById(polisId);
    if (!polis) {
      return res.status(404).json({ message: "Polis tidak ditemukan" });
    }

    const today = new Date();
    if (new Date(polis.endingDate) < today) {
      return res.status(400).json({
        message: "Masa berlaku polis telah berakhir. Klaim tidak dapat diajukan.",
      });
    }

    const klaim = new Klaim({
      polisId,
      jumlahKlaim,
      deskripsi,
      namaRekening,
      noRekening,
    });

    const savedKlaim = await klaim.save();
    res.status(201).json(savedKlaim);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllKlaim = async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    let klaim;

    // Jika ada search → cari berdasarkan nama user
    if (search) {
      klaim = await Klaim.find()
        .populate({
          path: "polisId",
          populate: {
            path: "userId",
            select: "name email",
            match: { name: { $regex: search, $options: "i" } },
          },
        }).sort({createdAt: -1});

      // Buang hasil yang userId = null (match gagal)
      klaim = klaim.filter(
        (k) => k.polisId && k.polisId.userId
      );
    } else {
      // Tanpa search → ambil semua
      klaim = await Klaim.find().populate({
        path: "polisId",
        populate: { path: "userId", select: "name email" },
      });
    }

    // Urutan status: menunggu → ditolak → disetujui
    const statusOrder = {
      menunggu: 0,
      ditolak: 1,
      disetujui: 2,
    };

    klaim = klaim.sort((a, b) => {
      return statusOrder[a.status] - statusOrder[b.status];
    });

    // Limit dari query
    const limitedData = klaim.slice(0, parseInt(limit));

    return res.status(200).json(limitedData);

  } catch (error) {
    console.error("Error fetching klaim:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data klaim." });
  }
};


export const getKlaimById = async (req, res) => {
  try {
    const klaim = await Klaim.findById(req.params.id).populate("polisId");
    if (!klaim) {
      return res.status(404).json({ message: "Klaim tidak ditemukan" });
    }
    res.json(klaim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getKlaimByUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Cari polis user
    const polisUser = await Polis.find({ userId }).select("_id");
    const polisIds = polisUser.map(p => p._id);

    if (polisIds.length === 0) {
      return res.status(200).json({
        message: "User belum memiliki klaim",
        klaim: [],
      });
    }

    // Ambil klaim user dengan field terbatas (tanpa populate polis)
    const klaim = await Klaim.find(
      { polisId: { $in: polisIds } },
      {
        status: 1,
        namaRekening: 1,
        nomorRekening: 1,
        jumlahKlaim: 1,
        tanggalKlaim: 1,
        deskripsi: 1,
        createdAt: 1
      }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Daftar klaim user",
      klaim,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateKlaim = async (req, res) => {
  try {
    const updated = await Klaim.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Klaim tidak ditemukan" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteKlaim = async (req, res) => {
  try {
    const deleted = await Klaim.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Klaim tidak ditemukan" });
    }
    res.json({ message: "Klaim berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};