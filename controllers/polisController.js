import { Polis } from "../models/polisModel.js";
import { Produk } from "../models/produkModel.js";
import crypto from "crypto";

function generatePolicyNumber() {
  const randomPart = crypto.randomBytes(5).toString("hex").toUpperCase(); 
  return `POLIS-${randomPart}`;
}


const hitungUmurKendaraan = (tanggal) => {
  if (!tanggal) return 0;

  const today = new Date();
  const tgl = new Date(tanggal);

  let umur = today.getFullYear() - tgl.getFullYear();

  // Cek apakah ulang tahun kendaraan sudah lewat
  const belumLewat =
    today.getMonth() < tgl.getMonth() ||
    (today.getMonth() === tgl.getMonth() && today.getDate() < tgl.getDate());

  if (belumLewat) umur -= 1;

  return umur < 0 ? 0 : umur;
};


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
                umurKendaraan, // ini berupa Date dari req.body
                hargaKendaraan = 0,
                merek,
                jenisKendaraan,
                nomorKendaraan,
                nomorRangka,
                nomorMesin,
                namaPemilik,
            } = detail.kendaraan || {};

            const umurDalamTahun = hitungUmurKendaraan(umurKendaraan);

            premium =
                premiDasar +
                (umurDalamTahun * premiDasar) / 12 +
                (hargaKendaraan * 0.02) / 12;

            detailData.kendaraan = {
                umurKendaraan,     // tetap simpan tanggal aslinya
                umurDalamTahun,    // kalau mau ikut simpan
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

    const polis = await Polis.create({
      userId,
      productId,
      policyNumber,
      premium,
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
      .populate("productId", "namaProduk tipe");

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

    const product = await Produk.findById(polis.productId);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

    const premiDasar = product.premiDasar;

    // gabungkan detail lama dan baru
    const mergedDetail = {
      ...polis.detail,
      ...req.body.detail
    };

    let premium = premiDasar;

    // ===== PERHITUNGAN ULANG SAMA PERSIS DENGAN CREATE =====
    switch (product.tipe) {
      case "kesehatan": {
        const { diabetes = 0, merokok = 0, hipertensi = 0 } = mergedDetail.kesehatan || {};

        premium =
          premiDasar +
          diabetes * (premiDasar * 0.3) +
          merokok * (premiDasar * 0.2) +
          hipertensi * (premiDasar * 0.4);

        mergedDetail.kesehatan = { diabetes, merokok, hipertensi };
        break;
      }

      case "jiwa": {
        const { jumlahTanggungan = 0, statusPernikahan = "belum" } = mergedDetail.jiwa || {};
        const menikah = statusPernikahan === "menikah" ? 1 : 0;

        premium =
          premiDasar +
          jumlahTanggungan / 3 +
          menikah * (jumlahTanggungan / 12);

        mergedDetail.jiwa = { jumlahTanggungan, statusPernikahan };
        break;
      }

      case "kendaraan": {
        const {
          umurKendaraan,
          hargaKendaraan = 0,
          merek,
          jenisKendaraan,
          nomorKendaraan,
          nomorRangka,
          nomorMesin,
          namaPemilik,
        } = mergedDetail.kendaraan || {};

        const umurDalamTahun = hitungUmurKendaraan(umurKendaraan);

        premium =
          premiDasar +
          (umurDalamTahun * premiDasar) / 12 +
          (hargaKendaraan * 0.02) / 12;

        mergedDetail.kendaraan = {
          umurKendaraan,
          umurDalamTahun,
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

    polis.detail = mergedDetail;
    polis.premium = premium;
    if (req.body.endingDate) polis.endingDate = req.body.endingDate;

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