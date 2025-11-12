import express from "express";
import { apiKeyAuth} from "./middleware/apiMiddleware.js";
import { verifyToken, checkOwnership, checkAdmin} from "./middleware/authMiddleware.js";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "./controllers/userController.js";

import {
    forgotPassword,
    loginUser,
    verifyCode,
    resetPassword,
} from "./controllers/authController.js";

import {
    createProduk,
    getAllProduk,
    getProdukById,
    updateProduk,
    deleteProduk,
} from "./controllers/produkController.js";

import {
    createPolis,
    getAllPolis,
    getPolisById,
    getPolisByUser,
    updatePolis,
    deletePolis,
} from "./controllers/polisController.js"

import {
  createPembayaran,
  scanPembayaran,
  getAllPembayaran,
  getPembayaranByUser,
  deletePembayaran,
  perpanjangPolis,
} from "./controllers/pembayaranController.js";

import {
  createKlaim,
  getAllKlaim,
  getKlaimById,
  getKlaimByUser,
  updateKlaim,
  deleteKlaim
} from "./controllers/klaimController.js";

const router = express.Router();

router.use(apiKeyAuth);

router.get("/users", getUsers); //Buat ambil semua data user   
router.get("/users/:id", getUserById); //ambil data user sesuai id
router.put("/users/:id", verifyToken, checkOwnership("User"), updateUser); //ubah data sesuai id dari mongoDB (hanya owner dan admin yang bisa akses)
router.delete("/users/:id", verifyToken, checkOwnership("User"), deleteUser); //hapus data sesuai id dari mongoDB (hanya owner dan admin yang bisa akses)

router.post("/auth/register", createUser); //bikin data user baru
router.post("/auth/login", loginUser); //login user, ada yang di return yaitu jwt
router.post("/auth/forgot-password", forgotPassword); //buat ngasih kode
router.post("/auth/verify-code", verifyCode);
router.post("/auth/reset-password", resetPassword);

router.post("/produk", verifyToken, checkAdmin(), createProduk);
router.get("/produk", getAllProduk);
router.get("/produk/:id", getProdukById);
router.put("/produk", verifyToken, checkAdmin(), updateProduk);
router.get("/produk", verifyToken, checkAdmin(), deleteProduk);

router.post("/polis", verifyToken, createPolis);
router.get("/polis/user", verifyToken, checkOwnership("Polis"), getPolisByUser);
router.get("/polis", verifyToken, checkAdmin(), getAllPolis);
router.get("/polis/:id", verifyToken, checkOwnership("Polis"), getPolisById);
router.put("/polis/:id", verifyToken, checkAdmin(), updatePolis);
router.delete("/polis/:id", verifyToken, checkOwnership("Polis"), deletePolis);

router.post("/payment", verifyToken, createPembayaran);
router.post("payment/perpanjangan", verifyToken ,perpanjangPolis);
router.get("/payment", verifyToken, checkAdmin(), getAllPembayaran);
router.get("/payment/user", verifyToken, getPembayaranByUser);
router.get("/payment/:id", verifyToken, checkOwnership("Pembayaran"), scanPembayaran);
router.delete("/payment/:id", verifyToken, deletePembayaran);

router.post("/klaim", verifyToken, checkOwnership("Klaim"), createKlaim);
router.get("/klaim", verifyToken, checkAdmin(), getAllKlaim);
router.get("/klaim/:id", verifyToken, checkOwnership("Klaim"), getKlaimById);
router.get("/klaim/user", verifyToken, checkOwnership("Klaim"), getKlaimByUser);
router.put("/klaim/:id", verifyToken, checkAdmin(), updateKlaim);
router.delete("/klaim/:id", verifyToken, checkOwnership("Polis"), deleteKlaim);

export default router;
