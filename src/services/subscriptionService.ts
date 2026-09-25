app.post("/notification-subscriptions", (req, res) => {
  saveSubscription(req.body);

  res.json({
    success: true,
  });
});
