# 📊 CGPA Calculator - Fresh Start Guide

## What You Have

A complete CGPA calculator system with:
- **Modern Web Interface** - Beautiful, responsive HTML/CSS/JS
- **Web Scraper Backend** - Node.js with Puppeteer
- **Automatic Calculations** - CGPA, SGPA, and detailed analysis
- **No Database Needed** - Direct portal integration

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Node.js
Download from https://nodejs.org/ (LTS version)

Verify installation:
```bash
node -v
npm -v
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- **express** - Web server
- **puppeteer** - Browser automation for scraping
- **cors** - Cross-origin support
- **body-parser** - JSON parsing

### Step 3: Start Server
```bash
npm start
```

You should see:
```
✅ CGPA Calculator Server running on http://localhost:5000
```

### Step 4: Open the Calculator
Open `cgpa-calculator.html` in your web browser (double-click the file)

Or manually navigate to it via file:// protocol

## How to Use

1. **Enter Details:**
   - Register Number (e.g., 2024ME001)
   - Date of Birth (DD-MM-YYYY format)

2. **Click "Fetch Results"** - System will:
   - Open college portal automatically
   - Fill in your details
   - Extract all results
   - Calculate CGPA & SGPA
   - Display analysis

3. **View Results:**
   - Overall CGPA
   - Semester-wise SGPA
   - Detailed results table
   - Performance analysis

## Files Included

- `cgpa-calculator.html` - Complete web interface (open this!)
- `server.js` - Node.js backend server
- `package.json` - Dependencies

That's it! Only 3 files.

## Troubleshooting

### "Cannot find module 'puppeteer'"
```bash
npm install puppeteer --save
```

### Port 5000 already in use
Change port in server.js:
```javascript
const PORT = process.env.PORT || 5001; // Use 5001 instead
```

Update HTML too (look for `const API_URL`):
```javascript
const API_URL = 'http://localhost:5001';
```

### Results not showing
1. Check browser console (F12) for errors
2. Verify register number format
3. Confirm DOB is DD-MM-YYYY
4. Check that college portal is accessible
5. Wait 30-60 seconds (first time is slower)

### "No results found"
- College portal might be down
- Register number might be invalid
- DOB might not match college records
- Try directly on college portal first to verify

## What the Calculator Does

### CGPA Calculation
- Collects all semester results
- Maps grades to points (O=10, A+=9, etc.)
- Calculates: (Sum of grade points × credits) / Total credits

### SGPA (Semester GPA)
- Calculates GPA for each semester separately
- Shows semester-wise performance

### Analysis
- Grade distribution chart
- Performance insights
- Trends across semesters
- Average marks
- Highest grades

## Grading Scale

| Grade | Points |
|-------|--------|
| O     | 10.0   |
| A+    | 9.0    |
| A     | 8.0    |
| B+    | 7.0    |
| B     | 6.0    |
| C     | 5.0    |
| P     | 4.0    |
| F/AB  | 0.0    |

## For Developers

### Customizing the College Portal URL

In `server.js`, line ~56:
```javascript
await page.goto('http://YOUR_COLLEGE_URL', {
    waitUntil: 'networkidle2',
    timeout: 30000
});
```

### Changing Default Credit Hours

In `server.js`, line ~68:
```javascript
const credits = result.credits || 4; // Change 4 to your default
```

### Customizing Colors

In `cgpa-calculator.html`, CSS variables (lines 15-24):
```css
:root {
    --primary: #6366f1;  /* Change these */
    --secondary: #ec4899;
    --accent: #f59e0b;
    /* ... */
}
```

## Next Steps

1. **Test it:**
   - Use your own register number and DOB
   - Download and share results

2. **Share with classmates:**
   - They can use the same HTML file
   - Just needs Node.js server running

3. **Deploy online:**
   - Railway.app (easiest, free)
   - Heroku
   - Any cloud provider with Node.js support

4. **Advanced features:**
   - Add filtering
   - Export to PDF
   - Comparison with batch average
   - Grade predictions

## Keyboard Shortcuts

While in form:
- **Tab** - Move to next field
- **Enter** - Submit form
- **Esc** - Clear form (if added)

## Browser Support

Works on:
- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Performance

- **First load:** 30-60 seconds (Puppeteer startup)
- **Subsequent loads:** 5-10 seconds
- **Calculation:** <100ms
- **Display:** Instant

## Features

✨ Modern dark UI
🎯 Fast calculation
📊 Detailed analysis
📱 Mobile responsive
🔒 No data stored externally
🎨 Beautiful animations
📈 Performance trends
💯 Accurate grading

## Questions?

1. **Check the code** - It's fully commented
2. **Test the college portal** - Make sure it's accessible
3. **Check console errors** (F12 in browser)
4. **Verify your credentials** - Register number and DOB format

## That's It!

You have a complete CGPA calculator. No setup wizards, no config files, no databases.

Just run `npm start` and open the HTML file!

---

**Happy calculating! 📊**
