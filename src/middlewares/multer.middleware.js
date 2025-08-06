import multer from "multer";
import fs from "fs";
import path from "path";

// define upload dir inside the current project working temp
const tempDir = path.join(process.cwd(), "public", "temp");
// ensure the dir exist..
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
console.log("Temp directory for uploads:", tempDir);
  
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
