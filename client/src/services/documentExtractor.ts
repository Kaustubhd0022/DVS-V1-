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
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean);
      
      if (pageStrings.length > 0) {
        pageTexts.push(pageStrings.join(' '));
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
 * Universal file text extractor for user uploads
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return extractTextFromPdf(file);
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
