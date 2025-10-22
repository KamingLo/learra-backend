import jwt from "jsonwebtoken";
import { getOwnerIdFromResource} from "../utils/ownership.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid atau sudah kadaluarsa" });
  }
};

export const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const ownerId = await getOwnerIdFromResource(modelName, req.params.id);
      if (!ownerId) {
        return res.status(404).json({ message: "Resource tidak ditemukan" });
      }

      const isAdmin = req.user.role === "admin";
      const isOwner = req.user.userId === String(ownerId);

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Akses ditolak, bukan admin atau pemilik data" });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Gagal memeriksa ownership", error: err.message });
    }
  };
};

export const checkAdmin = () => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Akses ditolak, hanya admin yang diizinkan" });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Gagal memeriksa peran admin", error: err.message });
    }
  };
};
