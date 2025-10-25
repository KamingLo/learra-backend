import { Klaim } from "../models/klaimModel.js";
import { Polis } from "../models/polisModel.js";

export const createKlaim = async (req, res) => {
  try {
    const { polisId, jumlahKlaim, deskripsi } = req.body;

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
    });

    const savedKlaim = await klaim.save();
    res.status(201).json(savedKlaim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllKlaim = async (req, res) => {
  try {
    const { userName } = req.query;
    let klaim;

    if (userName) {
      klaim = await Klaim.find()
        .populate({
          path: "polisId",
          populate: {
            path: "userId",
            select: "name email",
            match: { name: { $regex: userName, $options: "i" } }, // cari user by name
          },
        });

      // filter hasil yang user-nya tidak cocok (karena match gagal → userId = null)
      klaim = klaim.filter(
        (k) => k.polisId && k.polisId.userId !== null
      ).slice(0, 20);

      if (klaim.length === 0) {
        return res.status(404).json({
          message: "Tidak ada klaim dengan nama user tersebut.",
        });
      }

      return res.status(200).json(klaim);
    }

    const data = await Klaim.find().populate({
      path: "polisId",
      populate: { path: "userId", select: "name email" },
    });

    res.status(200).json(data);
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
    const userId = req.user._id;
    const klaim = await Klaim.find()
      .populate({
        path: "polisId",
        match: { userId },
      })
      .then((result) => result.filter((k) => k.polisId));

    res.json(klaim);
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
