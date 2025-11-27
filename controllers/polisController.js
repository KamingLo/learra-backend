import { Polis } from "../models/polisModel.js";
import { Produk } from "../models/produkModel.js";

function generatePolicyNumber() {
  return `POLIS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export const createPolis = async (req, res) => {
  try {
    const { userId, productId, detail } = req.body;

    const product = await Produk.findById(productId);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

    const premiDasar = product.premiDasar;
    if (premiDasar === undefined)
      return res.status(400).json({ message: "Produk tidak memiliki premiDasar" });

    const policyNumber = generatePolicyNumber();

    let premium = premiDasar;
    let detailData = {};

    switch (product.tipe) {
      case "kesehatan": {
        const { diabetes = 0, merokok = 0, hipertensi = 0 } = detail.kesehatan || {};
        premium =
          premiDasar +
          diabetes * (premiDasar * 0.3) +
          merokok * (premiDasar * 0.2) +
          hipertensi * (premiDasar * 0.4);

        detailData.kesehatan = { diabetes, merokok, hipertensi };
        break;
      }

      case "jiwa": {
        const { jumlahTanggungan = 0, statusPernikahan = "belum" } = detail.jiwa || {};
        const menikah = statusPernikahan === "menikah" ? 1 : 0;

        premium =
          premiDasar +
          jumlahTanggungan / 3 +
          menikah * (jumlahTanggungan / 12);

        detailData.jiwa = { jumlahTanggungan, statusPernikahan };
        break;
      }

      case "kendaraan": {
        const {
          umurKendaraan = 0,
          hargaKendaraan = 0,
          merek,
          jenisKendaraan,
          nomorKendaraan,
          nomorRangka,
          nomorMesin,
          namaPemilik,
        } = detail.kendaraan || {};

        premium =
          premiDasar +
          (umurKendaraan * premiDasar) / 12 +
          (hargaKendaraan * 0.02) / 12;

        detailData.kendaraan = {
          umurKendaraan,
          hargaKendaraan,
          merek,
          jenisKendaraan,
          nomorKendaraan,
          nomorRangka,
          nomorMesin,
          namaPemilik,
        };
        break;
      }

      default:
        return res.status(400).json({ message: "Tipe produk tidak dikenali" });
    }

    const endingDate = new Date();
    endingDate.setMonth(endingDate.getMonth() + 1);

    const polis = await Polis.create({
      userId,
      productId,
      policyNumber,
      premium,
      endingDate,
      detail: detailData,
    });

    res.status(201).json(polis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllPolis = async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;

    let query = {};

    // Jika search, coba dulu cari berdasarkan policyNumber
    if (search) {
      query = { policyNumber: { $regex: search, $options: "i" } };
    }

    let polis = await Polis.find(query)
      .populate("userId", "name email")
      .populate("productId", "name tipe")
      .sort({createdAt: -1});

    // Jika tidak ketemu nomor polis, cari berdasarkan nama user
    if (search && polis.length === 0) {
      polis = await Polis.find()
        .populate({
          path: "userId",
          select: "name email",
          match: { name: { $regex: search, $options: "i" } },
        })
        .populate("productId", "name tipe");

      // Buang yang userId null karena tidak match
      polis = polis.filter((p) => p.userId);
    }

    // Urutan status: inaktif dulu
    const statusOrder = {
      inaktif: 0,
      aktif: 1,
    };

    polis = polis.sort((a, b) => {
      return statusOrder[a.status] - statusOrder[b.status];
    });

    // Limit dari query, default 20
    const limited = polis.slice(0, parseInt(limit));

    return res.status(200).json(limited);

  } catch (err) {
    console.error("Error fetching polis:", err.message);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data polis."
    });
  }
};

export const getPolisById = async (req, res) => {
  try {
    const polis = await Polis.findById(req.params.id)
      .populate("userId", "name email")
      .populate("productId", "name tipe");

    if (!polis) return res.status(404).json({ message: "Polis tidak ditemukan" });
    res.json(polis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPolisByUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(userId)
    const polis = await Polis.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    if (!polis || polis.length === 0) {
      return res.status(404).json({ message: "Belum ada polis untuk user ini." });
    }

    res.status(200).json({
      message: "Daftar polis user",
      polis,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePolis = async (req, res) => {
  try {
    const polis = await Polis.findById(req.params.id);
    if (!polis) return res.status(404).json({ message: "Polis tidak ditemukan" });

    const updates = req.body;

    if (updates.status && updates.status === "dibatalkan" && updates.statusReason) {
      polis.status = "dibatalkan";
      polis.statusReason = updates.statusReason;
    }

    if (updates.endingDate) polis.endingDate = updates.endingDate;
    if (updates.premium) polis.premium = updates.premium;
    if (updates.detail) polis.detail = { ...polis.detail, ...updates.detail };

    const updated = await polis.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePolis = async (req, res) => {
  try {
    const polis = await Polis.findByIdAndDelete(req.params.id);
    if (!polis) return res.status(404).json({ message: "Polis tidak ditemukan" });
    res.json({ message: "Polis berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};