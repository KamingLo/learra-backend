import { User } from "../models/userModel.js";
import { Polis } from "../models/polisModel.js";
import { Pembayaran } from "../models/pembayaranModel.js"
import { Klaim } from "../models/klaimModel.js";
export const getOwnerIdFromResource = async (modelName, id) => {
  switch (modelName) {
    case "User": {
      const user = await User.findById(id);
      return user?._id;
    }

    case "Polis": {
      const polis = await Polis.findById(id);
      return polis?.userId?._id;
    }

    case "Pembayaran": {
      const pembayaran = await Pembayaran.findById(id);
      return pembayaran?.polis?.userId?._id;
    }

    case "Klaim": {
      const klaim = await Klaim.findById(id);
      return klaim?.polis?.userId?._id;
    }

    default:
      throw new Error("Model tidak dikenali untuk ownership");
  }
};
