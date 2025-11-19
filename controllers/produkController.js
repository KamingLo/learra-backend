import { Produk } from "../models/produkModel.js"

export const createProduk = async (req, res) => {
    try{
        const produk = new Produk(req.body);
        const saved = await produk.save();
        res.status(201).json(saved);
    } catch(error){
        res.status(400).json({ message: error.message});
    }
};

export const getAllProduk = async (req, res) => {
  try {
    // Menggunakan 'search' untuk mencari di Nama Produk ATAU Tipe Produk
    const { search } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { namaProduk: { $regex: search, $options: "i" } },
        { tipe: { $regex: search, $options: "i" } }
      ];
    }

    const produk = await Produk.find(query);

    if (produk.length === 0) {
      // Kita return 200 dengan array kosong agar frontend tidak error, atau 404 jika preferensi logic Anda begitu.
      // Disini saya kembalikan array kosong status 200 agar lebih umum.
      return res.status(200).json([]); 
    }

    res.status(200).json(produk);
  } catch (error) {
    console.error("Error fetching produk:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data produk." });
  }
};

export const getProdukById = async (req, res) => {
  try {
    const produk = await Produk.findById(req.params.id);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.status(200).json(produk);
  } catch (error) {
    res.status(400).json({ message: "ID tidak valid" });
  }
};

export const updateProduk = async (req, res) => {
  try {
    const updated = await Produk.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.status(201).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduk = async (req, res) => {
  try {
    const deleted = await Produk.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};