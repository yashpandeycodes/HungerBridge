import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyCode: string
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"HungerBridge" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "HungerBridge - Verify Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #ea580c; text-align: center;">Welcome to HungerBridge!</h2>
          <p>Hi <b>${name}</b>,</p>
          <p>Thank you for registering. Please use the following OTP to verify your account:</p>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #0f172a; letter-spacing: 5px; margin: 0;">${verifyCode}</h1>
          </div>
          <p>If you did not request this code, please ignore this email.</p>
          <p>Rescue Food. Fight Hunger.<br/><b>The HungerBridge Team</b></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Verification email sent successfully' };
    
  } catch (error) {
    console.error("Error sending verification email with Nodemailer", error);
    return { success: false, message: 'Failed to send verification email' };
  }
}