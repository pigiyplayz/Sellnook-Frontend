const { Resend } = require("resend");
const fetch = require("node-fetch");

const resend = new Resend(process.env.RESEND_API_KEY);

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

exports.addToWaitlist = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Save email to Firestore via REST API
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/waitlist?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            email: { stringValue: email },
            createdAt: { timestampValue: new Date().toISOString() }
          }
        })
      }
    );

    // Email to YOU
    await resend.emails.send({
      from: "SellNook <no-reply@sellnook.com>",
      to: "your-email@example.com",
      subject: "🎉 New SellNook Waitlist Signup",
      html: `
        <h2>🎉 New Waitlist Signup</h2>
        <p>Someone just joined the SellNook waitlist:</p>
        <p style="font-size:18px;"><strong>${email}</strong></p>
        <p>Keep building. This is getting real.</p>
      `
    });

    // Email to USER
    await resend.emails.send({
      from: "SellNook <no-reply@sellnook.com>",
      to: email,
      subject: "👋 You’re on the SellNook Waitlist",
      html: `
        <h2>👋 Welcome to SellNook!</h2>
        <p>You're officially on the waitlist. We’re launching this summer and you’ll be one of the first to know.</p>
        <p>Start thinking about what you’ll sell first — that old bike, the gaming gear, or the stuff taking up closet space.</p>
        <p>Thanks for being early.<br>— The SellNook Team</p>
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    res.status(500).json({ error: "Failed to process waitlist signup" });
  }
};
