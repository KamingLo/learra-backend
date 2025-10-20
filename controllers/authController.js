import { User } from "../models/userModel.js";
import { PasswordReset } from "../models/passwordReset.js";
import { passwordTemplate } from "../email/emailTemplate.js"; 
import transporter from "../config/mail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    await PasswordReset.findOneAndUpdate(
      { email },
      { code, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: "lokaming86@gmail.com",
      to: email,
      subject: "Password Reset Code",
      html: passwordTemplate({
        userName: user.name,
        code: code,
      }),
    });

    return res.json({ message: "Verification code sent to email." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const record = await PasswordReset.findOne({ email, code });
    if (!record) return res.status(400).json({ message: "Invalid code" });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "Code expired" });
    record.verified = true;

    const resetToken = new mongoose.Types.ObjectId().toString();
    record.resetToken = resetToken;
    await record.save();

    return res.json({ message: "Code verified", record});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword, confirmNewPassword } = req.body;
  try {
    const record = await PasswordReset.findOne({ email, resetToken, verified: true });

    if (!record) return res.status(400).json({ message: "Invalid or expired token" });

    if (newPassword!== confirmNewPassword) {
      return res.status(400).json({ message: "Password dan konfirmasi tidak cocok" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    await PasswordReset.deleteOne({ email });

    return res.json({ message: "Password successfully changed." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
