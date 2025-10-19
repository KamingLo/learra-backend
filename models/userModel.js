import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    birthDate: { type: Date, required: true },
    address: { type: String, required: true  },
    nomorIdentitas: {type: String, required: true, unique:true},
    pekerjaan: {type: String, required: true },
    rentangGaji: {type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
