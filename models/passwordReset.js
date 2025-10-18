import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  resetToken: { type: String }, // optional token sementara
});

export const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
