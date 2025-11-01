/**
 * File Mock Utilities
 *
 * Creates File API-compatible mock objects for testing file upload/import functionality.
 */

/**
 * Creates a mock File object from an ArrayBuffer
 * @param {ArrayBuffer} buffer - File content as ArrayBuffer
 * @param {string} fileName - File name (e.g., "test.xlsx")
 * @param {string} mimeType - MIME type (e.g., "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
 * @returns {File} - Mock File object with browser File API interface
 */
export function createMockFile(buffer, fileName, mimeType) {
  const blob = new Blob([buffer], { type: mimeType });

  // Create a File-like object
  const file = new File([blob], fileName, {
    type: mimeType,
    lastModified: Date.now()
  });

  return file;
}

/**
 * Creates a mock File object from a string
 * @param {string} content - File content as string
 * @param {string} fileName - File name (e.g., "test.txt")
 * @param {string} mimeType - MIME type (e.g., "text/plain")
 * @returns {File} - Mock File object
 */
export function createMockFileFromString(content, fileName, mimeType) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(content);
  return createMockFile(buffer.buffer, fileName, mimeType);
}

/**
 * Creates a mock Excel file from a 2D array using SheetJS
 * @param {Array<Array<string>>} data - Excel data as 2D array (rows x columns)
 * @param {string} fileName - File name (e.g., "tasks.xlsx")
 * @returns {Promise<File>} - Resolves to mock Excel File object
 */
export async function createMockExcelFile(data, fileName) {
  // Dynamically import SheetJS (only when needed)
  const XLSX = await import('xlsx');

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Generate Excel file buffer
  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  });

  // Create File object
  return createMockFile(
    buffer,
    fileName,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}
