# 🚀 How to Run the Navvipal Document Viewer App

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

Check if installed:
```bash
node --version
npm --version
```

## 📦 Step-by-Step Setup

### Step 1: Navigate to Project Directory
```bash
cd /Users/neel/WebstormProjects/shareDocApp
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React
- Axios
- React-PDF
- XLSX
- PapaParse
- And other dependencies

### Step 3: Create Environment File

Create a `.env` file in the project root:
```bash
touch .env
```

Open the `.env` file and add:
```
REACT_APP_API_BASE_URL=https://doc-service.navvipal.com
```

**Important**: Make sure there are no spaces around the `=` sign.

### Step 4: Start the Development Server
```bash
npm start
```

This will:
- Start the React development server
- Open your default browser automatically
- Navigate to `http://localhost:3000`

## 🌐 How to View a Document

Once the app is running, access documents using this URL format:

```
http://localhost:3000/doc?share_id=YOUR_SHARE_ID_HERE
```

**Example:**
```
http://localhost:3000/doc?share_id=f2517c85-620c-4789-8efd-a8d2db159df5
```

## 🛠️ Available Commands

### Development Mode
```bash
npm start
```
- Runs the app in development mode
- Opens at [http://localhost:3000](http://localhost:3000)
- Hot-reloads when you make changes

### Production Build
```bash
npm run build
```
- Creates optimized production build in `build/` folder
- Minifies and optimizes all files
- Ready for deployment

### Run Tests
```bash
npm test
```
- Launches the test runner

## 🔍 Troubleshooting

### Issue: "Cannot find module" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: API calls failing
**Solution:**
1. Check `.env` file exists and has correct URL
2. Restart development server (Ctrl+C, then `npm start`)
3. Clear browser cache and reload

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

### Issue: PDF not loading
**Solution:**
1. Check internet connection (PDF.js worker loads from CDN)
2. Clear browser cache
3. Try a different browser

### Issue: Blank screen
**Solution:**
1. Check browser console for errors (F12)
2. Make sure `.env` file is created
3. Restart development server
4. Clear browser cache

## 🖥️ Browser Support

The app works best on:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 📱 Mobile Access

To test on mobile devices on the same network:

1. Find your computer's IP address:
   ```bash
   # On Mac/Linux
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```

2. Use the IP address instead of localhost:
   ```
   http://YOUR_IP_ADDRESS:3000/doc?share_id=...
   ```

   Example:
   ```
   http://192.168.1.100:3000/doc?share_id=f2517c85-620c-4789-8efd-a8d2db159df5
   ```

## 🚀 Deployment

### Deploy to Production

1. Build the app:
   ```bash
   npm run build
   ```

2. The `build/` folder contains production-ready files

3. Deploy to your hosting service:
   - **AWS Amplify**: Connect your repository
   - **Netlify**: Drag & drop `build/` folder
   - **Vercel**: Import from GitHub
   - **Traditional hosting**: Upload `build/` folder contents

### Environment Variables for Production

Create `.env.production` with:
```
REACT_APP_API_BASE_URL=https://doc-service.navvipal.com
```

## 📊 Project Structure

```
shareDocApp/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── Header.js
│   │   ├── DocumentViewer.js
│   │   ├── AdvancedImageViewer.js
│   │   ├── AdvancedPDFViewer.js
│   │   └── CountdownTimer.js
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.js          # Main app component
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── .env                # Environment variables (create this)
├── package.json        # Dependencies
└── README.md          # Documentation
```

## ✨ Features Available

✅ **Multi-format support**: Images, PDFs, CSV, Excel, Text files  
✅ **Advanced viewers**: Zoom, pan, navigate for images and PDFs  
✅ **Security features**: Watermarks, no-download, no-screenshot protection  
✅ **View-once documents**: Single-access documents  
✅ **Expiry handling**: Time-limited document access  
✅ **Countdown timer**: Real-time expiry countdown  
✅ **Mobile responsive**: Works on all devices  

## 🆘 Need Help?

If you encounter any issues:

1. Check the browser console (F12) for errors
2. Review the `ENV_SETUP.md` file for environment setup
3. Make sure all dependencies are installed
4. Verify the API endpoint is accessible
5. Restart the development server

## 🔗 Quick Links

- Main documentation: `README.md`
- Environment setup: `ENV_SETUP.md`
- Project repository: (your git repository)

---

**Happy Coding! 🎉**

