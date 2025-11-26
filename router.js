import express from "express";
import { apiKeyAuth} from "./middleware/apiMiddleware.js";
import { verifyToken, checkOwnership, checkAdmin} from "./middleware/authMiddleware.js";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
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
  confirmPembayaran,
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

// Middleware Global untuk API Key
router.use(apiKeyAuth);

// --- USERS ---
router.get("/users", getUsers); // Mendukung ?search=
router.get("/users/:id", checkAdmin(),getUserById);
router.get("/users/profile",verifyToken, checkOwnership("User"), getUserProfile )
router.put("/users/:id", verifyToken, checkOwnership("User"), updateUser);
router.delete("/users/:id", verifyToken, checkOwnership("User"), deleteUser);

// --- AUTH ---
router.post("/auth/register", createUser);
router.post("/auth/login", loginUser);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/verify-code", verifyCode);
router.post("/auth/reset-password", resetPassword);

// --- PRODUK ---
router.post("/produk", verifyToken, checkAdmin(), createProduk);
router.get("/produk", getAllProduk); // Mendukung ?search=
router.get("/produk/:id", getProdukById);
router.put("/produk/:id", verifyToken, checkAdmin(), updateProduk); // Note: pastikan ada :id
router.delete("/produk/:id", verifyToken, checkAdmin(), deleteProduk); // Note: pastikan ada :id

// --- POLIS ---
router.post("/polis", verifyToken, createPolis);
router.get("/polis/user", verifyToken, getPolisByUser);
router.get("/polis", verifyToken, checkAdmin(), getAllPolis); // Mendukung ?search=
router.get("/polis/:id", verifyToken, checkOwnership("Polis"), getPolisById);
router.put("/polis/:id", verifyToken, checkAdmin(), updatePolis);
router.delete("/polis/:id", verifyToken, checkOwnership("Polis"), deletePolis);

// --- PEMBAYARAN ---
router.post("/payment", verifyToken, createPembayaran); // User mengajukan pembayaran
router.post("/payment/perpanjangan", verifyToken, perpanjangPolis); // User mengajukan perpanjangan
router.get("/payment", verifyToken, checkAdmin(), getAllPembayaran); // Admin melihat list (Mendukung ?search=)
router.get("/payment/user", verifyToken, getPembayaranByUser); // User melihat history

// Endpoint Konfirmasi (Pengganti Scan QR)
router.put("/payment/:id/confirm", verifyToken, checkAdmin(), confirmPembayaran); 

router.delete("/payment/:id", verifyToken, deletePembayaran);

// --- KLAIM ---
router.post("/klaim", verifyToken, checkOwnership("Klaim"), createKlaim);
router.get("/klaim", verifyToken, checkAdmin(), getAllKlaim); // Mendukung ?search=
router.get("/klaim/:id", verifyToken, checkOwnership("Klaim"), getKlaimById);
router.get("/klaim/user", verifyToken, getKlaimByUser);
router.put("/klaim/:id", verifyToken, checkAdmin(), updateKlaim);
router.delete("/klaim/:id", verifyToken, checkOwnership("Polis"), deleteKlaim);

export default router;