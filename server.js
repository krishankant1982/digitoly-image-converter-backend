import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import Razorpay from "razorpay";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- STORAGE ---------------- */

const upload = multer({ dest: "uploads/" });

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("converted")) fs.mkdirSync("converted");

/* ---------------- FREE LIMIT STORAGE ---------------- */

const usage = {}; // { email_ip : downloadCount }

/* ---------------- RAZORPAY ---------------- */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret"
});

/* ---------------- ROOT ---------------- */

app.get("/", (req, res) => {
  res.send("Digitoly API running");
});

/* ---------------- CONVERT IMAGE ---------------- */

app.post("/convert", upload.single("image"), async (req, res) => {

  try {

    const file = req.file;
    const format = req.body.format || "jpeg";
    const email = req.body.email || "guest";

    const userIP =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown";

    const key = email + "_" + userIP;

    if (!usage[key]) usage[key] = 0;

    if (usage[key] >= 5) {
      return res.json({
        limitReached: true,
        message: "Free limit reached. Please upgrade."
      });
    }

    const outputName = Date.now() + "." + format;
    const outputPath = "converted/" + outputName;

    await sharp(file.path)
      .toFormat(format)
      .toFile(outputPath);

    fs.unlinkSync(file.path);

    usage[key]++;

    res.json({
      success: true,
      url: "/download/" + outputName,
      remaining: 5 - usage[key]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Conversion failed"
    });

  }

});

/* ---------------- DOWNLOAD FILE ---------------- */

app.get("/download/:file", (req, res) => {

  const file = req.params.file;
  const filePath = path.join("converted", file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath);

});

/* ---------------- CREATE PAYMENT ORDER ---------------- */

app.post("/create-order", async (req, res) => {

  const { amount } = req.body;

  try {

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });

    res.json(order);

  } catch (err) {

    res.status(500).json({
      error: "Payment order creation failed"
    });

  }

});

/* ---------------- VERIFY PAYMENT ---------------- */

app.post("/verify-payment", (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
    .update(sign)
    .digest("hex");

  if (expected === razorpay_signature) {

    res.json({
      success: true
    });

  } else {

    res.status(400).json({
      success: false
    });

  }

});

const archiver = require("archiver")

app.post("/zip", async (req,res)=>{

const files = req.body.files

const archive = archiver("zip")

res.attachment("digitoly-images.zip")

archive.pipe(res)

files.forEach(file=>{
archive.file("uploads/"+file,{name:file})
})

archive.finalize()

})

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Digitoly API running on port " + PORT);
});

