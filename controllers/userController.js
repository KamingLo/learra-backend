import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/userModel.js";

// REGISTER / CREATE USER
export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, ...rest } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password dan konfirmasi tidak cocok" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      ...rest,
    });

    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
