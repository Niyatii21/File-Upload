const express = require("express");
const multer = require("multer");
const { Dropbox } = require("dropbox");
const path = require("path");
require("dotenv").config({ path: './dropbox.env' });

const app = express();
const upload = multer({ dest: "uploads/" });

const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

if (!DROPBOX_ACCESS_TOKEN) {
  console.error("Error: Dropbox Access Token is not set in the .env file!");
  process.exit(1);
}

const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });

// Serve the index.html file for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).send("No file uploaded!");
  }

  const dropboxPath = `/${file.originalname}`;
  try {
    const fileContent = require("fs").readFileSync(file.path);
    console.log(`Uploading file to path: ${dropboxPath}`);

    await dbx.filesUpload({
      path: dropboxPath,
      contents: fileContent,
      mode: "add",
      autorename: true,
    });

    res.status(200).send("File uploaded successfully to Dropbox!");
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Error uploading file to Dropbox.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
