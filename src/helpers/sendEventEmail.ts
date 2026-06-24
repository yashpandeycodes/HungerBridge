import nodemailer from "nodemailer";

export async function sendEventEmail(
  email: string,
  name: string,
  eventType: "Donation Accepted" | "Volunteer Assigned" | "Delivery Completed",
  customMessage: string
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const eventStyles = {
      "Donation Accepted": { color: "#16a34a", icon: "✅" }, // Green
      "Volunteer Assigned": { color: "#2563eb", icon: "🚚" }, // Blue
      "Delivery Completed": { color: "#ea580c", icon: "🎉" }  // Orange (HungerBridge Theme)
    };

    const style = eventStyles[eventType];

    const mailOptions = {
      from: `"HungerBridge" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `HungerBridge Update: ${eventType} ${style.icon}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: ${style.color}; text-align: center;">${style.icon} ${eventType}</h2>
          <p>Hi <b>${name}</b>,</p>
          <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid ${style.color}; border-radius: 4px; margin: 20px 0; font-size: 16px; line-height: 1.5; color: #334155;">
            ${customMessage}
          </div>
          <p style="color: #64748b; font-size: 14px;">Thank you for being a crucial part of our mission.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="text-align: center; color: #94a3b8; font-size: 12px;">
            Rescue Food. Fight Hunger.<br/><b>The HungerBridge Team</b>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Event email sent successfully' };
    
  } catch (error) {
    console.error("Error sending event email with Nodemailer", error);
    return { success: false, message: 'Failed to send event email' };
  }
}