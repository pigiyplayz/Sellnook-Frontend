const express = require("express");
const path = require("path");
const waitlistRoute = require("./routes/waitlist");

const app = express();
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// API routes
app.use("/api/waitlist", waitlistRoute);

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SellNook running on port ${PORT}`));
