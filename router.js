import express from "express";
import { apiKeyAuth} from "./middleware/apiMiddleware.js";
import { verifyToken, checkOwnership} from "./middleware/authMiddleware.js";
import jwt from "jsonwebtoken";

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

router.get("/check-token", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, decoded });
  } catch (err) {
    res.json({ valid: false, error: err.message });
  }
});

export default router;
