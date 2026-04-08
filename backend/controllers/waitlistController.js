const { Resend } = require("resend");
const admin = require("firebase-admin");

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

exports.addToWaitlist = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Save to Firebase Firestore
    await db.collection("waitlist").add({
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Email to you
    await resend.emails.send({
      from: "SellNook <no-reply@sellnook.com>",
      to: "your-email@example.com", // change this
      subject: "🎉 New SellNook Waitlist Signup",
      html: `
        <h2>🎉 New Waitlist Signup</h2>
        <p>Someone just joined the SellNook waitlist:</p>
        <p style="font-size:18px;"><strong>${email}</strong></p>
        <p>Keep building. This is getting real.</p>
      `
    });

    // Email to user
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
