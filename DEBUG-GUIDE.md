# Debugging Guide - Import Not Working

## Quick Test

### Option 1: Use the Test Page
1. Open terminal in the project directory
2. Start a web server:
   ```bash
   python -m http.server 8000
   ```
3. Open browser to: **http://localhost:8000/test-app.html**
4. Try importing your Excel file
5. Check the status messages on the page

### Option 2: Check Main App Console
1. Start web server (same as above)
2. Open: **http://localhost:8000**
3. Open **Browser Developer Tools**:
   - Chrome/Edge: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Firefox: Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
   - Safari: Enable Developer menu first (Preferences → Advanced → Show Develop menu), then press `Cmd+Option+C`

4. Go to the **Console** tab
5. Look for these messages:
   ```
   DOM loaded, initializing app...
   Setting up event listeners...
   ✓ File input listener attached
   ✓ Import button listener attached
   App initialized successfully
   Task Scheduler initialized
   ```

6. Click "Import Excel" button - you should see:
   ```
   Import button clicked
   ```

7. Select your Excel file - you should see:
   ```
   handleFileImport called
   Processing file: yourfile.xlsx
   Calling ExcelImporter.importFile...
   ```

## Common Issues & Solutions

### Issue 1: "Failed to load module" or CORS error
**Symptom**: Console shows errors like:
```
Access to script at 'file:///...' has been blocked by CORS policy
```

**Solution**: **MUST serve via HTTP**, not open file directly
```bash
# In project directory
python -m http.server 8000

# Or if you have Node.js
npx http-server -p 8000
```

Then open **http://localhost:8000** (not file://)

### Issue 2: Button does nothing, no console messages
**Possible causes**:
- JavaScript error preventing initialization
- Wrong file opened (make sure it's index.html at root)

**Check**:
1. Open Console (F12)
2. Look for RED errors at the top
3. If you see "ExcelImporter is not defined" or similar, refresh the page

### Issue 3: "SheetJS library not loaded"
**Solution**: XLSX needs to load before modules
- Check that `assets/lib/xlsx.full.min.js` exists
- Make sure browser loads it (check Network tab in DevTools)

### Issue 4: File dialog doesn't open
**Check console for**:
```
✗ File input element not found
✗ Import button element not found
```

**Solution**: Make sure you're opening the correct HTML file (index.html)

### Issue 5: Import runs but all tasks are invalid
**This is what we fixed!** The app now accepts both:
- Excel time format (decimal): `0.0625`, `0.08333`
- Text format: `"1:30"`, `"2:00"`

**To verify it's working**, check console for:
```
Import result: {tasks: Array(X), summary: {valid: X, invalid: 0}}
```

## Expected Console Output (Success)

```
DOM loaded, initializing app...
Setting up event listeners...
✓ File input listener attached
✓ Import button listener attached
App initialized successfully
Task Scheduler initialized
[Click Import button]
Import button clicked
[Select file]
handleFileImport called
Processing file: 20251101-Plans.xlsx
Calling ExcelImporter.importFile...
Import result: {tasks: Array(5), summary: {valid: 5, invalid: 0, fileName: "20251101-Plans.xlsx"}}
Imported 5 valid tasks
```

## Still Not Working?

Copy the **full console output** and share it - it will show exactly where the issue is!

Also try the test page first - it has more detailed error messages:
```
http://localhost:8000/test-app.html
```
