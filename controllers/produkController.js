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
    const produk = await Produk.find();
    res.json(produk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProdukById = async (req, res) => {
  try {
    const produk = await Produk.findById(req.params.id);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json(produk);
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
    res.json(updated);
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
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};