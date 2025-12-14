const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const cors = require("cors")({ origin: true });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Handle preflight request
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "POST");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).send("");
      }

      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { amount, currency, receipt, notes } = req.body;

      if (!amount || !currency) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const order = await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes
      });

      res.set("Access-Control-Allow-Origin", "*");
      return res.status(200).json(order);

    } catch (error) {
      console.error("Razorpay order error:", error);
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(500).json({ error: "Order creation failed" });
    }
  });
});
