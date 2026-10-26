/**
 * Universal Document and Script Text Extractor
 * Handles PDF files (via pdfjs-dist), plain text (.txt, .md, .fountain), and raw script formats.
 */
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs-dist
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('[DocumentExtractor] Could not set workerSrc:', e);
  }
}

/**
 * Extracts plain text from a PDF file using pdfjs-dist with fallback
 */
/**
 * Extracts plain text from a PDF file using pdfjs-dist with Y-coordinate newline preservation
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY: number | null = null;
      const pageLines: string[] = [];
      let currentLine = '';

      for (const item of textContent.items as any[]) {
        if (!('str' in item)) continue;
        const str = item.str || '';
        const y = item.transform ? item.transform[5] : null;

        // If vertical position changes by more than 3pt or hasEOL is set, break line
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = str;
        } else {
          currentLine += (currentLine.length > 0 && !currentLine.endsWith(' ') && !str.startsWith(' ') ? ' ' : '') + str;
        }

        if (item.hasEOL) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = '';
        }
        lastY = y;
      }

      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }

      if (pageLines.length > 0) {
        pageTexts.push(pageLines.join('\n'));
      }
    }

    const fullText = pageTexts.join('\n\n').trim();
    if (fullText.length > 30) {
      return fullText;
    }
  } catch (err) {
    console.warn('[DocumentExtractor] pdfjs-dist extraction failed, trying stream fallback:', err);
  }

  // Fallback: Simple text stream parser for PDF text operators (Tj / TJ / BT)
  try {
    const rawBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(rawBuffer);
    const decoder = new TextDecoder('latin1');
    const rawContent = decoder.decode(bytes);

    // Look for parenthesized strings inside PDF streams
    const matches = rawContent.match(/\(([^()]{2,})\)\s*(?:Tj|'|")/g);
    if (matches && matches.length > 10) {
      const extracted = matches
        .map(m => m.replace(/^[(\s]+|[)\s'"]+$/g, ''))
        .filter(s => s.length > 1 && !/^[0-9a-f]{4,}$/i.test(s))
        .join(' ');
      if (extracted.length > 100) {
        return extracted;
      }
    }
  } catch (fallbackErr) {
    console.error('[DocumentExtractor] Fallback extraction failed:', fallbackErr);
  }

  return `[Uploaded Document: ${file.name}]`;
};

/**
 * Extracts plain text from DOCX archives (unzipping word/document.xml)
 */
export const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Scan for local file header (PK\x03\x04) matching "word/document.xml"
    let docXmlBytes: Uint8Array | null = null;
    let pos = 0;
    while (pos < bytes.length - 30) {
      if (bytes[pos] === 0x50 && bytes[pos + 1] === 0x4b && bytes[pos + 2] === 0x03 && bytes[pos + 3] === 0x04) {
        const compressionMethod = bytes[pos + 8] | (bytes[pos + 9] << 8);
        const compressedSize = bytes[pos + 18] | (bytes[pos + 19] << 8) | (bytes[pos + 20] << 16) | (bytes[pos + 21] << 24);
        const fileNameLength = bytes[pos + 26] | (bytes[pos + 27] << 8);
        const extraLength = bytes[pos + 28] | (bytes[pos + 29] << 8);

        const fileNameBytes = bytes.slice(pos + 30, pos + 30 + fileNameLength);
        const fileName = new TextDecoder().decode(fileNameBytes);

        const dataOffset = pos + 30 + fileNameLength + extraLength;
        if (fileName === 'word/document.xml') {
          const compData = bytes.slice(dataOffset, dataOffset + compressedSize);
          if (compressionMethod === 8 && typeof DecompressionStream !== 'undefined') {
            // Deflate raw decompression
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(compData);
            writer.close();
            const decompressedArrayBuffer = await new Response(ds.readable).arrayBuffer();
            docXmlBytes = new Uint8Array(decompressedArrayBuffer);
          } else if (compressionMethod === 0) {
            docXmlBytes = compData;
          }
          break;
        }
        pos = dataOffset + compressedSize;
      } else {
        pos++;
      }
    }

    if (docXmlBytes) {
      const xmlStr = new TextDecoder('utf-8').decode(docXmlBytes);
      // Extract paragraphs and text runs: <w:p>...</w:p> with <w:t> tags
      const paragraphs = xmlStr.match(/<w:p[\s>].*?<\/w:p>/g) || [];
      const lines = paragraphs.map(p => {
        const textRuns = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
        return textRuns.map(t => t.replace(/<[^>]+>/g, '')).join('');
      }).filter(Boolean);

      if (lines.length > 0) {
        return lines.join('\n');
      }
    }
  } catch (err) {
    console.warn('[DocumentExtractor] DOCX extraction error:', err);
  }

  // Fallback: If decompression is unavailable, inform user cleanly
  throw new Error(`Could not parse Word document "${file.name}". Please upload as PDF, TXT, or Fountain format.`);
};

/**
 * Universal file text extractor for user uploads
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return extractTextFromPdf(file);
  }

  if (extension === 'docx') {
    return extractTextFromDocx(file);
  }

  // Text-based formats (.txt, .md, .fountain, .fdx, etc.)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      resolve(text);
    };
    reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
    reader.readAsText(file);
  });
};
