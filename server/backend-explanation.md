# 📚 Backend Complete Code Explanation (Step-by-Step)

## 📋 Table of Contents
1. [Project Structure Overview](#project-structure)
2. [Package.json - Dependencies](#packagejson)
3. [app.js - Main Server File](#appjs)
4. [Models - Database Schema](#models)
5. [Services - Business Logic](#services)
6. [Controllers - Request Handlers](#controllers)
7. [Routes - API Endpoints](#routes)
8. [Utils - Helper Functions](#utils)
9. [Data Flow Diagram](#data-flow)

---

## 1. Project Structure Overview {#project-structure}

```
server/
├── app.js                      # Main server entry point
├── package.json                # Dependencies aur scripts
├── .env                        # Environment variables
├── models/
│   └── Invoice.js              # MongoDB schema
├── services/
│   ├── pdfService.js           # PDF parsing logic
│   └── geminiService.js        # AI integration
├── controllers/
│   └── invoiceController.js    # Request handlers
├── routes/
│   └── invoiceRoutes.js        # API routes
├── utils/
│   └── upload.js               # File upload config
└── uploads/                    # Temporary PDF storage
```

**Har folder ka purpose:**
- **models**: Database structure define karta hai
- **services**: Business logic (PDF parsing, AI calls)
- **controllers**: HTTP requests handle karte hain
- **routes**: URL endpoints define karte hain
- **utils**: Helper functions aur configurations

---

## 2. Package.json - Dependencies {#packagejson}

```json
{
  "name": "invoice-processing-server",
  "version": "1.0.0",
  "type": "module",  // ⭐ ES6 modules enable (import/export)
  "scripts": {
    "start": "node app.js",      // Production
    "dev": "nodemon app.js"      // Development (auto-restart)
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",  // Gemini AI SDK
    "cors": "^2.8.5",                     // Cross-origin requests
    "dotenv": "^16.3.1",                  // Environment variables
    "express": "^4.18.2",                 // Web framework
    "json2csv": "^6.0.0-alpha.2",         // CSV export
    "mongoose": "^8.0.0",                 // MongoDB ODM
    "multer": "^1.4.5-lts.1",             // File upload
    "pdf-parse": "^1.1.1"                 // PDF text extraction
  }
}
```

**Key Points:**
- `"type": "module"` → ES6 syntax use kar sakte hain (`import` instead of `require`)
- `nodemon` → Development mein file change hone par auto-restart
- Har dependency ka specific purpose hai

---

## 3. app.js - Main Server File {#appjs}

Yeh file server ka **entry point** hai. Step-by-step samajhte hain:

### Step 1: Imports (Lines 1-5)

```javascript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes.js';
```

**Kya ho raha hai:**
- `express` → Web server banane ke liye
- `mongoose` → MongoDB se connect karne ke liye
- `cors` → Frontend (React) se requests allow karne ke liye
- `dotenv` → [.env](file:///C:/Users/dev/Desktop/Ali%27s%20Wokspace/invoice-processing-system/server/.env) file se secrets load karne ke liye
- `invoiceRoutes` → API routes import kar rahe hain

### Step 2: Environment Variables Load (Line 8)

```javascript
dotenv.config();
```

**Kya ho raha hai:**
- [.env](file:///C:/Users/dev/Desktop/Ali%27s%20Wokspace/invoice-processing-system/server/.env) file se `GEMINI_API_KEY`, `MONGODB_URI` etc. load ho rahe hain
- `process.env.VARIABLE_NAME` se access kar sakte hain

### Step 3: Express App Initialize (Lines 15-16)

```javascript
const app = express();
const PORT = process.env.PORT || 5000;
```

**Kya ho raha hai:**
- `app` → Express application instance
- `PORT` → [.env](file:///C:/Users/dev/Desktop/Ali%27s%20Wokspace/invoice-processing-system/server/.env) se PORT read karo, nahi toh 5000 use karo

### Step 4: Middleware Setup (Lines 19-27)

```javascript
app.use(cors());                              // ← Frontend se requests allow
app.use(express.json());                      // ← JSON body parse karo
app.use(express.urlencoded({ extended: true })); // ← Form data parse karo

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();  // ← Next middleware ko call karo
});
```

**Kya ho raha hai:**
- **Middleware** = Har request se pehle run hone wala code
- `cors()` → React app (port 3000) se requests allow karta hai
- `express.json()` → Request body ko JSON mein parse karta hai
- Logging middleware → Har request console mein print hoti hai
- `next()` → Next middleware/route handler ko control pass karo

### Step 5: Routes Setup (Line 30)

```javascript
app.use('/api/invoice', invoiceRoutes);
```

**Kya ho raha hai:**
- `/api/invoice` se shuru hone wale sab routes `invoiceRoutes` file mein hain
- Example: `/api/invoice/upload` → `invoiceRoutes` file handle karegi

### Step 6: Health Check Endpoint (Lines 33-39)

```javascript
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Invoice Processing System API is running',
        timestamp: new Date().toISOString()
    });
});
```

**Kya ho raha hai:**
- Simple endpoint to check if server is running
- Browser mein `http://localhost:5000/api/health` open karo → response milega

### Step 7: 404 Handler (Lines 42-47)

```javascript
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});
```

**Kya ho raha hai:**
- Agar koi route match nahi hua, toh yeh run hoga
- 404 = Not Found error

### Step 8: Global Error Handler (Lines 50-58)

```javascript
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
```

**Kya ho raha hai:**
- Koi bhi unhandled error yahan catch hoga
- Development mode mein error message show hoga
- Production mein sirf generic message

### Step 9: Database Connection (Lines 63-76)

```javascript
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-processing';
        
        await mongoose.connect(mongoURI);
        
        console.log('✓ MongoDB connected successfully');
        console.log(`  Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('✗ MongoDB connection error:', error.message);
        process.exit(1);  // ← Server band kar do agar DB connect nahi hua
    }
};
```

**Kya ho raha hai:**
- `async/await` → Asynchronous operation (wait for DB connection)
- `mongoose.connect()` → MongoDB se connect karo
- Agar error aaye toh server exit kar jaye (`process.exit(1)`)

### Step 10: Start Server (Lines 81-108)

```javascript
const startServer = async () => {
    try {
        // Pehle database connect karo
        await connectDB();
        
        // Phir server start karo
        app.listen(PORT, () => {
            console.log('Server running on: http://localhost:' + PORT);
            // ... more console logs
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};
```

**Kya ho raha hai:**
1. Pehle MongoDB connect hota hai
2. Phir Express server port 5000 par listen karta hai
3. Success message console mein print hota hai

### Step 11: Graceful Shutdown (Lines 111-116)

```javascript
process.on('SIGINT', async () => {
    console.log('\n\nShutting down gracefully...');
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
});
```

**Kya ho raha hai:**
- `SIGINT` = Ctrl+C press karne par
- Pehle database connection close karo
- Phir server exit karo
- Yeh "graceful shutdown" hai (data loss nahi hoga)

### Step 12: Execute (Line 119)

```javascript
startServer();
```

**Kya ho raha hai:**
- Server start ho raha hai!

---

## 4. Models - Database Schema {#models}

### Invoice.js - MongoDB Schema

```javascript
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,  // ← Mandatory field
        trim: true       // ← Extra spaces remove karo
    },
    vendor: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    total: {
        type: Number,
        required: true,
        min: 0  // ← Negative values allowed nahi
    },
    rawText: {
        type: String,
        required: true  // ← Original PDF text
    },
    items: [{  // ← Array of objects
        name: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now  // ← Automatically set
    }
});
```

**Schema Explanation:**

1. **invoiceNumber** (String)
   - Invoice ka unique number
   - Required hai
   - `trim: true` → Extra spaces remove

2. **vendor** (String)
   - Vendor/company ka naam
   - Example: "Acme Corp"

3. **date** (Date)
   - Invoice ki date
   - MongoDB mein Date object ke roop mein store

4. **total** (Number)
   - Total amount
   - `min: 0` → Negative nahi ho sakta

5. **rawText** (String)
   - PDF se extract kiya hua original text
   - Debugging ke liye useful

6. **items** (Array)
   - Line items ka array
   - Har item mein:
     - [name](file:///C:/Users/dev/Desktop/Ali%27s%20Wokspace/invoice-processing-system/server/utils/upload.js#19-24) → Product name
     - `quantity` → Kitni quantity
     - `price` → Unit price

7. **createdAt** (Date)
   - Automatically set hota hai jab document create ho

### Indexes (Lines 55-57)

```javascript
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ vendor: 1 });
invoiceSchema.index({ createdAt: -1 });
```

**Kya ho raha hai:**
- **Index** = Fast searching ke liye
- `{ invoiceNumber: 1 }` → Ascending order index
- `{ createdAt: -1 }` → Descending order (newest first)
- Indexes se queries fast hoti hain

### Model Creation (Line 59)

```javascript
const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
```

**Kya ho raha hai:**
- `mongoose.model()` → Schema se model bana rahe hain
- Model use karke database operations karenge (save, find, etc.)

---

## 5. Services - Business Logic {#services}

### 5.1 pdfService.js - PDF Text Extraction

```javascript
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

class PDFService {
    async extractText(filePath) {
        try {
            // Step 1: PDF file ko buffer mein read karo
            const dataBuffer = await fs.readFile(filePath);
            
            // Step 2: pdf-parse library se text extract karo
            const pdfData = await pdfParse(dataBuffer);
            
            // Step 3: Text ko trim karo (extra spaces remove)
            const text = pdfData.text.trim();
            
            // Step 4: Validate - text empty toh nahi?
            if (!text || text.length === 0) {
                throw new Error('PDF appears to be empty');
            }
            
            console.log(`✓ Extracted ${text.length} characters`);
            
            return text;
        } catch (error) {
            // Error handling
            if (error.message.includes('Invalid PDF')) {
                throw new Error('Invalid or corrupted PDF file');
            }
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }
    
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);  // ← File delete karo
            console.log(`✓ Cleaned up: ${filePath}`);
        } catch (error) {
            console.error(`Warning: Could not delete ${filePath}`);
        }
    }
}

export default new PDFService();
```

**Step-by-Step:**

1. **fs.readFile()** → PDF file ko binary buffer mein read karo
2. **pdfParse()** → Buffer se text extract karo
3. **Validation** → Check karo ki text empty toh nahi
4. **Error Handling** → Specific errors ke liye specific messages
5. **deleteFile()** → Processing ke baad temporary file delete karo

**Why Singleton Pattern?**
```javascript
export default new PDFService();
```
- Ek hi instance banaya aur export kiya
- Har jagah same instance use hoga

---

### 5.2 geminiService.js - AI Integration

Yeh sabse important service hai! Step-by-step samajhte hain:

#### Constructor & Lazy Initialization

```javascript
class GeminiService {
    constructor() {
        this.genAI = null;   // ← Initially null
        this.model = null;
    }
    
    initialize() {
        if (this.genAI) {
            return;  // ← Already initialized
        }
        
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not set');
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
            model: 'models/gemini-2.5-flash'
        });
        
        console.log('✓ Gemini AI initialized');
    }
}
```

**Kya ho raha hai:**
- **Lazy Initialization** = Jab zarurat ho tab initialize karo
- Constructor mein sirf `null` set kiya
- [initialize()](file:///c:/Users/dev/Desktop/Ali%27s%20Wokspace/invoice-processing-system/server/services/geminiService.js#14-38) pehli baar call hone par setup hoga
- Agar already initialized hai toh skip kar do

**Why Lazy?**
- `dotenv.config()` pehle run hona chahiye
- Module import time par environment variables available nahi hote

#### Main Method: structureInvoiceData()

```javascript
async structureInvoiceData(rawText) {
    try {
        // Step 1: Initialize if needed
        this.initialize();
        
        // Step 2: Create prompt
        const prompt = `
You are an expert invoice data extraction system.

INVOICE TEXT:
${rawText}

INSTRUCTIONS:
1. Extract invoice number, vendor, date, total
2. Extract all line items
3. Return ONLY valid JSON
4. Use exact format below

REQUIRED JSON FORMAT:
{
  "invoiceNumber": "string",
  "vendor": "string",
  "date": "YYYY-MM-DD",
  "total": number,
  "items": [
    {
      "name": "string",
      "quantity": number,
      "price": number
    }
  ]
}

Return only JSON, nothing else.
`;
        
        console.log('🤖 Sending to Gemini AI...');
        
        // Step 3: Call Gemini API
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✓ Received response');
        
        // Step 4: Parse JSON from response
        const structuredData = this.parseGeminiResponse(text);
        
        // Step 5: Validate data
        this.validateInvoiceData(structuredData);
        
        return structuredData;
        
    } catch (error) {
        // Error handling
        if (error.message.includes('API key')) {
            throw new Error('Invalid Gemini API key');
        }
        throw new Error(`AI processing failed: ${error.message}`);
    }
}
```

**Step-by-Step Flow:**

1. **Initialize** → Gemini client setup karo
2. **Create Prompt** → AI ko detailed instructions do
3. **API Call** → Gemini se response lo
4. **Parse Response** → JSON extract karo
5. **Validate** → Data sahi hai ya nahi check karo

**Prompt Engineering:**
- Clear instructions diye
- Expected format bataya
- Edge cases handle kiye (missing fields)

#### Helper: parseGeminiResponse()

```javascript
parseGeminiResponse(text) {
    try {
        let cleanText = text.trim();
        
        // Remove markdown code blocks
        cleanText = cleanText.replace(/```json\s*/g, '');
        cleanText = cleanText.replace(/```\s*/g, '');
        
        // Find JSON object
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('No valid JSON found');
        }
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        throw new Error(`Failed to parse: ${error.message}`);
    }
}
```

**Kya ho raha hai:**
- Gemini kabhi-kabhi markdown format mein response deta hai
- ` ```json ` markers remove karo
- Regex se JSON object find karo
- Parse karke return karo

#### Helper: validateInvoiceData()

```javascript
validateInvoiceData(data) {
    const errors = [];
    
    // Check required fields
    if (!data.invoiceNumber || typeof data.invoiceNumber !== 'string') {
        errors.push('Invalid invoiceNumber');
    }
    
    if (!data.vendor || typeof data.vendor !== 'string') {
        errors.push('Invalid vendor');
    }
    
    if (!data.date) {
        errors.push('Missing date');
    }
    
    if (typeof data.total !== 'number' || data.total < 0) {
        errors.push('Invalid total');
    }
    
    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Invalid items array');
    } else {
        // Validate each item
        data.items.forEach((item, index) => {
            if (!item.name) {
                errors.push(`Item ${index + 1}: Missing name`);
            }
            if (typeof item.quantity !== 'number') {
                errors.push(`Item ${index + 1}: Invalid quantity`);
            }
            if (typeof item.price !== 'number') {
                errors.push(`Item ${index + 1}: Invalid price`);
            }
        });
    }
    
    if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    console.log('✓ Validation passed');
}
```

**Kya ho raha hai:**
- Har field ko validate karo
- Type checking (string, number, array)
- Range checking (total >= 0)
- Items array mein har item validate karo
- Agar errors hain toh throw karo

---

## 6. Controllers - Request Handlers {#controllers}

### invoiceController.js

Controller ka kaam hai HTTP requests handle karna. Chaar main functions hain:

#### 6.1 uploadInvoice() - PDF Upload & Processing

```javascript
async uploadInvoice(req, res) {
    let filePath = null;
    
    try {
        // Step 1: Check if file uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        
        filePath = req.file.path;
        console.log(`📄 Processing: ${req.file.originalname}`);
        
        // Step 2: Extract text from PDF
        const rawText = await pdfService.extractText(filePath);
        
        // Step 3: Structure data using AI
        const structuredData = await geminiService.structureInvoiceData(rawText);
        
        // Step 4: Save to MongoDB
        const invoice = new Invoice({
            ...structuredData,  // ← Spread operator
            rawText
        });
        
        await invoice.save();
        
        console.log(`✓ Saved: ${invoice.invoiceNumber}`);
        
        // Step 5: Clean up file
        await pdfService.deleteFile(filePath);
        
        // Step 6: Send success response
        res.status(201).json({
            success: true,
            message: 'Invoice processed successfully',
            data: invoice
        });
        
    } catch (error) {
        console.error('Upload error:', error.message);
        
        // Clean up on error
        if (filePath) {
            await pdfService.deleteFile(filePath);
        }
        
        // Send error response
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

**Complete Flow:**

1. **File Check** → `req.file` mein file hai ya nahi
2. **PDF → Text** → `pdfService.extractText()`
3. **Text → JSON** → `geminiService.structureInvoiceData()`
4. **Save to DB** → `new Invoice().save()`
5. **Cleanup** → Temporary file delete
6. **Response** → Success/error JSON bhejo

**Error Handling:**
- Try-catch block
- Cleanup in catch block bhi
- Proper HTTP status codes (201, 400, 500)

#### 6.2 getAllInvoices() - List All Invoices

```javascript
async getAllInvoices(req, res) {
    try {
        const invoices = await Invoice.find()
            .select('-rawText')      // ← rawText exclude karo
            .sort({ createdAt: -1 }); // ← Newest first
        
        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoices'
        });
    }
}
```

**Kya ho raha hai:**
- `Invoice.find()` → Sab invoices fetch karo
- `.select('-rawText')` → rawText field exclude (performance)
- `.sort({ createdAt: -1 })` → Descending order (newest first)
- Response mein count bhi bhejo

#### 6.3 getInvoiceById() - Single Invoice Details

```javascript
async getInvoiceById(req, res) {
    try {
        const { id } = req.params;  // ← URL se ID lo
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        
        const invoice = await Invoice.findById(id);
        
        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: invoice
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoice'
        });
    }
}
```

**Kya ho raha hai:**
- `req.params.id` → URL se ID extract karo
- Regex validation → MongoDB ObjectId format check
- `findById()` → Database se fetch
- 404 if not found

#### 6.4 exportInvoices() - CSV Export

```javascript
async exportInvoices(req, res) {
    try {
        // Fetch all invoices
        const invoices = await Invoice.find().select('-rawText');
        
        if (invoices.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No invoices to export'
            });
        }
        
        // Flatten data for CSV
        const flattenedData = invoices.map(invoice => ({
            invoiceNumber: invoice.invoiceNumber,
            vendor: invoice.vendor,
            date: invoice.date.toISOString().split('T')[0],
            total: invoice.total,
            itemCount: invoice.items.length,
            createdAt: invoice.createdAt.toISOString()
        }));
        
        // Define CSV columns
        const fields = [
            { label: 'Invoice Number', value: 'invoiceNumber' },
            { label: 'Vendor', value: 'vendor' },
            { label: 'Date', value: 'date' },
            { label: 'Total', value: 'total' },
            { label: 'Item Count', value: 'itemCount' },
            { label: 'Created At', value: 'createdAt' }
        ];
        
        // Convert to CSV
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(flattenedData);
        
        // Set download headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
        
        res.status(200).send(csv);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to export'
        });
    }
}
```

**Step-by-Step:**
1. Sab invoices fetch karo
2. Data ko flatten karo (nested items ko count mein convert)
3. CSV columns define karo
4. `json2csv` library se convert karo
5. Response headers set karo (file download ke liye)
6. CSV send karo

---

## 7. Routes - API Endpoints {#routes}

### invoiceRoutes.js

```javascript
import express from 'express';
import invoiceController from '../controllers/invoiceController.js';
import upload, { handleMulterError } from '../utils/upload.js';

const router = express.Router();

// Upload invoice PDF
router.post(
    '/upload',
    upload.single('invoice'),     // ← Multer middleware
    handleMulterError,            // ← Error handler
    invoiceController.uploadInvoice
);

// Get all invoices
router.get('/', invoiceController.getAllInvoices);

// Export CSV (must be before /:id)
router.get('/export', invoiceController.exportInvoices);

// Get single invoice
router.get('/:id', invoiceController.getInvoiceById);

export default router;
```

**Route Order Important Hai:**
```
/export  ← Pehle specific route
/:id     ← Baad mein dynamic route
```

Agar order ulta ho toh `/export` ko `:id` samajh lega!

**Middleware Chain:**
```
upload.single('invoice')  → File upload handle
handleMulterError         → Upload errors catch
invoiceController.upload  → Main logic
```

---

## 8. Utils - Helper Functions {#utils}

### upload.js - Multer Configuration

```javascript
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6 modules mein __dirname nahi hota
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        // Unique filename generate
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only PDFs
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (ext !== '.pdf') {
        return cb(new Error('Only PDF files allowed'), false);
    }
    
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Invalid file type'), false);
    }
    
    cb(null, true);  // ← Accept file
};

// Multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB
    }
});

// Error handler middleware
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Max 10MB'
            });
        }
        return res.status(400).json({
            success: false,
            error: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next();
};

export default upload;
```

**Key Concepts:**

1. **diskStorage** → Files disk par save hongi
2. **destination** → `uploads/` folder mein
3. **filename** → Unique name generate (timestamp + random)
4. **fileFilter** → Sirf PDF files accept
5. **limits** → Max 10MB file size
6. **Error Handler** → Specific error messages

---

## 9. Complete Data Flow {#data-flow}

### Upload Flow (Step-by-Step)

```
1. User uploads PDF from React frontend
   ↓
2. POST /api/invoice/upload
   ↓
3. Multer middleware
   - Validates file type (PDF only)
   - Validates file size (< 10MB)
   - Saves to uploads/ folder
   - Adds file info to req.file
   ↓
4. invoiceController.uploadInvoice()
   ↓
5. pdfService.extractText()
   - Reads PDF file
   - Extracts text using pdf-parse
   - Returns raw text string
   ↓
6. geminiService.structureInvoiceData()
   - Sends text to Gemini AI
   - Gets structured JSON response
   - Validates data
   - Returns structured object
   ↓
7. new Invoice().save()
   - Creates MongoDB document
   - Saves to database
   - Returns saved invoice
   ↓
8. pdfService.deleteFile()
   - Deletes temporary PDF
   ↓
9. Response to frontend
   - Status: 201 Created
   - Data: Saved invoice object
```

### Fetch Flow

```
1. Frontend requests invoices
   ↓
2. GET /api/invoice
   ↓
3. invoiceController.getAllInvoices()
   ↓
4. Invoice.find()
   - Queries MongoDB
   - Excludes rawText field
   - Sorts by createdAt (newest first)
   ↓
5. Response to frontend
   - Status: 200 OK
   - Data: Array of invoices
```

### Export Flow

```
1. User clicks "Export CSV"
   ↓
2. GET /api/invoice/export
   ↓
3. invoiceController.exportInvoices()
   ↓
4. Invoice.find()
   - Fetch all invoices
   ↓
5. Data flattening
   - Convert nested structure to flat
   ↓
6. json2csv conversion
   - Convert JSON to CSV format
   ↓
7. Response
   - Content-Type: text/csv
   - Content-Disposition: attachment
   - Browser downloads file
```

---

## 🎯 Summary

### Key Technologies Used:

1. **Express.js** → Web server framework
2. **Mongoose** → MongoDB ODM
3. **Multer** → File upload handling
4. **pdf-parse** → PDF text extraction
5. **Google Gemini AI** → Text structuring
6. **json2csv** → CSV export

### Design Patterns:

1. **MVC Pattern** → Models, Controllers, Routes separated
2. **Service Layer** → Business logic in services
3. **Singleton Pattern** → Services exported as instances
4. **Middleware Pattern** → Request processing chain
5. **Error Handling** → Try-catch with specific errors

### Best Practices:

1. ✅ **Async/Await** → Clean asynchronous code
2. ✅ **Error Handling** → Comprehensive try-catch
3. ✅ **Validation** → Input validation at multiple levels
4. ✅ **Logging** → Console logs for debugging
5. ✅ **Cleanup** → Delete temporary files
6. ✅ **Separation of Concerns** → Each file has one responsibility
7. ✅ **Environment Variables** → Secrets in .env file

---

## 📝 Important Notes

### Environment Variables Required:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/invoice-processing
GEMINI_API_KEY=your_api_key_here
MAX_FILE_SIZE=10485760
```

### API Endpoints Summary:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/invoice/upload` | Upload & process PDF |
| GET | `/api/invoice` | Get all invoices |
| GET | `/api/invoice/:id` | Get single invoice |
| GET | `/api/invoice/export` | Download CSV |
| GET | `/api/health` | Health check |

### Error Codes:

- **200** → Success
- **201** → Created
- **400** → Bad Request (validation error)
- **404** → Not Found
- **500** → Server Error

---

**Yeh complete backend explanation hai! Har file, har function, har line ka purpose samajh aa gaya hoga. Koi doubt ho toh poochein! 🚀**
