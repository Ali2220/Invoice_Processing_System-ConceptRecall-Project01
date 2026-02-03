import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Ye Node ko bolta hai: Is file ka full address (URL form) batao. For example:file:///C:/Users/Ali/project/server/middleware/upload.js
// __filename = is file ka poora address
// __dirname  = is file ka folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "invoice-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Hum chek kr rhe hain ke file ka extension .pdf hi ho.
// Humne yhn pr double security lgayi hai pdf upload krne ke liye.
// Humne Mime type is liye check kia hai, ke koi bhi file ke extension ko .pdf kr skta hai, lekin asal mai wo pdf hoga nhi.
const fileFilter = (req, file, cb) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext !== ".pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }

  // Check MIME type
  if (file.mimetype !== "application/pdf") {
    return cb(
      new Error("Invalid file type. Only PDF files are accepted."),
      false,
    );
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  //  pdf file max 10mb ki honi chahiye, is se ziyada ki nhi honi chahiye. Further, process.env se MAX_FILE_SIZE le rhy hain, or aus ko parseInt se integer mai convert kr rhy hain, kio ke process.env ki values string hoti hain.
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
});

/**
 * Multer error handler middleware
 */
export const handleMulterError = (err, req, res, next) => {
  // pehle hum check kr rhe hain ke error multer ka hai ya nhi.
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size too large. Maximum size is 10MB.",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }
  // Agar error Multer ka nahi
  else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
};

export default upload;
