const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.addToWaitlist = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Send YOU a notification
    await resend.emails.send({
      from: "SellNook <no-reply@sellnook.com>",
      to: "your-email@example.com", // replace with your real email
      subject: "New Waitlist Signup",
      html: `<p>A new user joined the waitlist:</p><p><strong>${email}</strong></p>`
    });

    // Send confirmation to the user
    await resend.emails.send({
      from: "SellNook <no-reply@sellnook.com>",
      to: email,
      subject: "You're on the SellNook Waitlist",
      html: `
        <h2>Welcome to SellNook!</h2>
        <p>Thanks for joining the waitlist. We'll notify you as soon as we launch in your area.</p>
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};
