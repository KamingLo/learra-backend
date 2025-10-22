import { User } from "../models/userModel.js";
import { Polis } from "../models/polisModel.js";
import { Pembayaran } from "../models/pembayaranModel.js"

export const getOwnerIdFromResource = async (modelName, id) => {
  switch (modelName) {
    case "User": {
      const user = await User.findById(id);
      return user?._id;
    }
    case "Polis": {
      const polis = await Polis.findById(id);
      return polis?.user._id;
    }
    case "Pembayaran": {
      const pembayaran = await Pembayaran.findById(id).populate("polis", "user");
      return pembayaran?.polis?.user._id;
    }
    default:
      throw new Error("Model tidak dikenali untuk ownership");
  }
};
