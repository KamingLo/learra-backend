import express from "express";
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


router.get("/users", getUsers); //Buat ambil semua data user
router.get("/users/:id", getUserById); //ambil data user sesuai id
router.put("/users/:id", updateUser); //ubah data sesuai id dari mongoDB
router.delete("/users/:id", deleteUser); //hapus data sesuai id dari mongoDB
router.post("/auth/register", createUser); //bikin data user baru
router.post("/auth/login", loginUser); //login user, ada yang di return yaitu jwt

router.post("/auth/forgot-password", forgotPassword); //buat ngasih kode
router.post("/auth/verify-code", verifyCode);
router.post("/auth/reset-password", resetPassword);


export default router;
