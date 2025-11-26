import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, nomorIdentitas, ...rest } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password dan konfirmasi tidak cocok" });
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { nomorIdentitas }]
    });

    if (existingUser) {
        if (existingUser.email === email) return res.status(400).json({ message: "Email sudah digunakan" });
        if (existingUser.nomorIdentitas === nomorIdentitas) return res.status(400).json({ message: "Nik sudah pernah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      nomorIdentitas,
      ...rest,
    });

    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({message: "User berhasil dibuat."});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Dari JWT middleware

    const user = await User.findById(userId)
      .select("-password -role");

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({
      message: "Data user yang sedang login",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUsers = async (req, res) => {
  try {
    // Menggunakan query parameter umum 'search'
    const { search } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },  // Perbaikan: 'nama' menjadi 'name'
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("name email phone address rentangGaji").limit(20);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data pengguna." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -nomorIdentitas");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
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
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};