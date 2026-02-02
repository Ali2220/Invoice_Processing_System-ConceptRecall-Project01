# 🚀 Quick Start Guide

## Prerequisites Check
- [ ] Node.js installed (v18+)
- [ ] MongoDB installed and running
- [ ] Gemini API key obtained

## Setup Steps

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_key_here
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Start MongoDB
```bash
# Windows (as service)
net start MongoDB

# Or manually
mongod --dbpath C:\data\db
```

### 5. Start Backend Server
```bash
cd ../server
npm run dev
```

Expected output:
```
✓ MongoDB connected successfully
Server running on: http://localhost:5000
```

### 6. Start Frontend (New Terminal)
```bash
cd client
npm run dev
```

Expected output:
```
Local: http://localhost:3000
```

### 7. Test the Application
1. Open browser to `http://localhost:3000`
2. Upload a sample invoice PDF
3. Wait for processing
4. View in dashboard
5. Click invoice to see details
6. Export to CSV

## Troubleshooting

**MongoDB not starting?**
- Check if service is installed: `sc query MongoDB`
- Or download from: https://www.mongodb.com/try/download/community

**npm command not found?**
- Install Node.js from: https://nodejs.org/

**Port already in use?**
- Change PORT in `.env` file
- Update Vite proxy in `client/vite.config.js`

**Gemini API errors?**
- Get key from: https://makersuite.google.com/app/apikey
- Check quota limits
- Verify key is correct in `.env`

## Next Steps
- Read the full [README.md](../README.md)
- Review [walkthrough.md](C:\Users\dev\.gemini\antigravity\brain\eccb01e7-4c8e-4bce-8710-72379abb7356\walkthrough.md)
- Test with your own invoices
