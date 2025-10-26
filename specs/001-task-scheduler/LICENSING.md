# Licensing & Distribution: Task Scheduler

**Date**: 2025-01-27  
**Application**: Task Scheduler (Static SPA)

## Summary

✅ **Safe for Commercial Distribution** - All embedded libraries permit commercial use without restrictions  
✅ **No Source Code Disclosure Required** - You can distribute the bundled application as-is  
⚠️ **Attribution Required** - Must include license notices for SheetJS library

## Embedded Libraries

### 1. SheetJS Community Edition (xlsx.js)

**Library**: SheetJS  
**Version**: Latest Community Edition  
**License**: Apache 2.0  
**File**: `assets/lib/xlsx.full.min.js`

**What You CAN Do:**
- ✅ Use in commercial applications
- ✅ Distribute bundled with your application
- ✅ Deploy to CDN, Google Drive, or any hosting platform
- ✅ Use without source code disclosure
- ✅ Modify the library if needed

**What You MUST Do:**
- ⚠️ Include Apache 2.0 LICENSE file with distribution
- ⚠️ Preserve copyright notices from SheetJS
- ⚠️ Include NOTICE file if the library includes one
- ⚠️ Document use of SheetJS library

**Restrictions:**
- ❌ Pro/Enterprise features require paid license (we're not using these)
- ❌ Cannot remove copyright notices
- ❌ Cannot use SheetJS trademarks without permission

**Implementation**: We use basic parsing features (reading .xlsx files) which are fully covered under Apache 2.0 Community Edition.

**Compliance Action Items**:
1. Include `LICENSE` file at root with Apache 2.0 text
2. Create `NOTICE` file listing SheetJS as a dependency
3. Document this in application credits (optional but recommended)

### 2. Native Browser APIs

**APIs Used**:
- HTML5 Drag-and-Drop API
- IndexedDB
- localStorage
- FileReader API
- Native fetch API (if used)

**License**: Public Domain / Web Standards  
**Restrictions**: None - these are standard browser APIs

✅ No attribution required  
✅ No restrictions on use or distribution  
✅ Commercial use permitted

## Application License

**Recommendation**: Choose one of the following:

### Option A: MIT License (Most Permissive)
- Simple, widely understood
- Compatible with Apache 2.0
- Allows commercial use
- Minimal restrictions

### Option B: Apache 2.0 (Match SheetJS)
- Same license as embedded library
- Well-established for commercial use
- Compatible with all dependencies

### Option C: Proprietary / Closed Source
- You maintain full rights
- No requirement to open source
- All embedded libraries permit this

## Distribution Compliance Checklist

When distributing the application:

### Required Actions

- [ ] Include `LICENSE` file with Apache 2.0 text (for SheetJS)
- [ ] Include `NOTICE` file listing SheetJS as dependency
- [ ] Preserve SheetJS copyright notices in bundled file
- [ ] Include license information in `README.md`

### Recommended Actions

- [ ] Create `CREDITS.md` or `ATTRIBUTIONS.md` listing libraries
- [ ] Add third-party licenses section to documentation
- [ ] Include license info in built application (comments in JS)

### Sample NOTICE File

```
Task Scheduler Application
Copyright (c) 2025 [Your Organization/Name]

This product includes software developed by SheetJS LLC.
SheetJS software is licensed under Apache License 2.0.
See LICENSE file for full text.

Third-Party Libraries:
- SheetJS Community Edition (xlsx.js) - Apache 2.0
  https://github.com/SheetJS/sheetjs
```

### Sample LICENSE Section for README

```markdown
## Third-Party Licenses

This application uses the following open-source libraries:

- **SheetJS Community Edition** - Apache 2.0 License
  - Used for Excel file parsing (.xlsx format)
  - Source: https://github.com/SheetJS/sheetjs
```

## Legal Considerations

### For Internal Use
✅ No restrictions - use freely within your organization

### For Customer Deployment
✅ Permitted - Apache 2.0 allows commercial distribution

### For Public Sale
✅ Permitted - no licensing fees required

### For Modification and Redistribution
✅ Permitted - Apache 2.0 allows modifications

## Important Notes

1. **No Paid License Required**: The basic Excel parsing features we use are covered by Apache 2.0 Community Edition
2. **Attribution is Simple**: Just include the license file and copyright notice
3. **No Source Disclosure**: You don't need to reveal your application's source code
4. **Google Drive Deployment**: Fully compliant - static hosting has no additional restrictions

## Compliance Verification

**Before Public Distribution:**
- [ ] LICENSE file present
- [ ] NOTICE file present
- [ ] SheetJS copyrights preserved in bundled JS
- [ ] README includes third-party licenses section

**For Commercial Customers:**
- [ ] License documentation provided
- [ ] No ambiguity about third-party licenses
- [ ] Professional appearance maintained

## Alternative: Switch to Lightweight Library

If licensing concerns arise, consider:
- **Realm JS**: MIT License, smaller footprint
- **CSV parsing**: No library needed, manual parsing
- **JSON format**: Replace Excel requirement with JSON import

However, SheetJS Apache 2.0 is industry standard and poses no practical restrictions for this use case.

