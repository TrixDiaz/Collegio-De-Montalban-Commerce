import nodemailer from "nodemailer";
import {MAIL_USER, MAIL_PASS} from "./env.js";
import {sendOtpEmailHtml} from "../utils/email-format.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

const sendOtpEmail = async ({to, otp, name}) => {
  try {
    const info = await transporter.sendMail({
      from: `"Auth Service" <${MAIL_USER}>`,
      to,
      subject: "OTP Verification",
      text: `Your OTP for registration is ${otp}`,
      html: sendOtpEmailHtml(name, otp),
    });
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};

export {transporter, sendOtpEmail};
