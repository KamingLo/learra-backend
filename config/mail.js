import nodemailer from "nodemailer";
import env from "dotenv";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_BREVO,
    pass: process.env.PW_BREVO,
  },
});

export default transporter;
