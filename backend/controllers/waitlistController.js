exports.addToWaitlist = (req, res) => {
  const { email } = req.body;

  console.log("New waitlist signup:", email);

  // Later: save to DB, send email, etc.
  res.json({ success: true });
};
