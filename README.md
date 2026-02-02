# 📊 Invoice Processing System

A full-stack application that uses AI to automatically extract and structure invoice data from PDF files. Built with React, Node.js, Express, MongoDB, and Google Gemini AI.

## 🎯 Features

- **PDF Upload**: Drag-and-drop or browse to upload invoice PDFs
- **AI-Powered Extraction**: Automatically extracts invoice data using Google Gemini AI
- **Structured Storage**: Stores invoices in MongoDB with full details
- **Dashboard View**: Browse all invoices with summary statistics
- **Detailed View**: View individual invoices with line items
- **CSV Export**: Download all invoices as CSV for reporting

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │ ───> │   Express   │ ───> │   MongoDB   │
│  Frontend   │ <─── │   Backend   │ <─── │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Gemini    │
                     │     AI      │
                     └─────────────┘
```

**Data Flow:**
1. User uploads PDF → Frontend sends to backend
2. Backend extracts text using `pdf-parse`
3. Raw text sent to Gemini AI for structuring
4. Structured data saved to MongoDB
5. Frontend displays invoice data

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Running locally or MongoDB Atlas
- **Google Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Installation & Setup

### 1. Clone or Navigate to Project

```bash
cd invoice-processing-system
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

**Edit `.env` file with your configuration:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/invoice-processing
GEMINI_API_KEY=your_actual_gemini_api_key_here
MAX_FILE_SIZE=10485760
```

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install
```

### 4. Start MongoDB

**Windows:**
```bash
# If MongoDB is installed as a service
net start MongoDB

# Or run manually
mongod --dbpath C:\data\db
```

**Mac/Linux:**
```bash
# If installed via Homebrew
brew services start mongodb-community

# Or run manually
mongod --dbpath /usr/local/var/mongodb
```

## 🎮 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server will start on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd client
npm run dev
```

Frontend will start on `http://localhost:3000`

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Upload Invoice
```http
POST /invoice/upload
Content-Type: multipart/form-data

Body:
  invoice: <PDF file>

Response:
{
  "success": true,
  "message": "Invoice processed successfully",
  "data": {
    "_id": "...",
    "invoiceNumber": "INV-001",
    "vendor": "Acme Corp",
    "date": "2024-01-15",
    "total": 1250.00,
    "items": [...],
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### 2. Get All Invoices
```http
GET /invoice

Response:
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

#### 3. Get Invoice by ID
```http
GET /invoice/:id

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "invoiceNumber": "INV-001",
    "vendor": "Acme Corp",
    "date": "2024-01-15",
    "total": 1250.00,
    "items": [
      {
        "name": "Product A",
        "quantity": 5,
        "price": 100.00
      }
    ],
    "rawText": "...",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### 4. Export Invoices as CSV
```http
GET /invoice/export

Response: CSV file download
```

## 🗂️ Project Structure

```
invoice-processing-system/
├── server/                    # Backend
│   ├── controllers/           # Request handlers
│   │   └── invoiceController.js
│   ├── models/                # MongoDB schemas
│   │   └── Invoice.js
│   ├── routes/                # API routes
│   │   └── invoiceRoutes.js
│   ├── services/              # Business logic
│   │   ├── pdfService.js      # PDF parsing
│   │   └── geminiService.js   # AI integration
│   ├── utils/                 # Utilities
│   │   └── upload.js          # Multer config
│   ├── uploads/               # Temporary file storage
│   ├── app.js                 # Express app
│   ├── package.json
│   └── .env.example
│
└── client/                    # Frontend
    ├── src/
    │   ├── components/        # React components
    │   │   ├── Navbar.jsx
    │   │   └── Navbar.css
    │   ├── pages/             # Page components
    │   │   ├── UploadPage.jsx
    │   │   ├── UploadPage.css
    │   │   ├── DashboardPage.jsx
    │   │   ├── DashboardPage.css
    │   │   ├── InvoiceDetailPage.jsx
    │   │   └── InvoiceDetailPage.css
    │   ├── services/          # API layer
    │   │   └── api.js
    │   ├── App.jsx            # Main app
    │   ├── App.css
    │   └── main.jsx           # Entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔧 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **pdf-parse** - PDF text extraction
- **@google/generative-ai** - Gemini AI SDK
- **multer** - File upload handling
- **json2csv** - CSV export
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations

## 🛡️ Error Handling

The system handles various error scenarios:

- ✅ **Non-PDF files rejected** - Only PDF files accepted
- ✅ **File size validation** - Max 10MB
- ✅ **Empty PDFs detected** - Validates text extraction
- ✅ **Corrupted PDFs handled** - Graceful error messages
- ✅ **Gemini API failures** - Retry logic and fallbacks
- ✅ **MongoDB errors** - Connection and validation errors
- ✅ **Network errors** - Frontend displays user-friendly messages

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds and glassmorphism
- **Responsive**: Works on desktop, tablet, and mobile
- **Drag & Drop**: Easy file upload
- **Loading States**: Spinners and progress indicators
- **Error Messages**: Clear, actionable error feedback
- **Animations**: Smooth transitions and hover effects

## 🔑 Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

## 🧪 Testing the System

1. **Start both servers** (backend and frontend)
2. **Navigate to** `http://localhost:3000`
3. **Upload a sample invoice PDF**
4. **Wait for processing** (usually 5-10 seconds)
5. **View in dashboard** - Click "Dashboard" in navigation
6. **Click on invoice** to see details
7. **Export CSV** - Click "Export CSV" button

## 📝 Database Schema

```javascript
Invoice {
  invoiceNumber: String,    // e.g., "INV-001"
  vendor: String,           // e.g., "Acme Corp"
  date: Date,               // Invoice date
  total: Number,            // Total amount
  rawText: String,          // Original extracted text
  items: [                  // Line items
    {
      name: String,         // Item name
      quantity: Number,     // Quantity
      price: Number         // Unit price
    }
  ],
  createdAt: Date          // Auto-generated timestamp
}
```

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists with correct values
- Ensure port 5000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure Vite proxy is configured correctly

### PDF upload fails
- Check file is actually a PDF
- Verify file size is under 10MB
- Check backend logs for specific error

### Gemini API errors
- Verify API key is correct in `.env`
- Check API quota hasn't been exceeded
- Ensure internet connection is stable

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Development

Built with ❤️ using modern web technologies and AI-powered automation.

---

**Happy Invoice Processing! 🚀**
