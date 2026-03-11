import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("converted")) fs.mkdirSync("converted");

app.get("/", (req, res) => {
  res.send("Digitoly API running");
});

app.post("/convert", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const format = req.body.format || "jpeg";

    const outputName = Date.now() + "." + format;
    const outputPath = "converted/" + outputName;

    await sharp(file.path)
      .toFormat(format)
      .toFile(outputPath);

    fs.unlinkSync(file.path);

    res.json({
      success: true,
      url: "/download/" + outputName
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "conversion failed" });
  }
});

app.get("/download/:file", (req, res) => {

  const filePath = path.join("converted", req.params.file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath);

});

/* IMPORTANT FOR RENDER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Digitoly API running on port " + PORT);
});
