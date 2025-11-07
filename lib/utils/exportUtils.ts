import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export type ExportFormat = 'png' | 'svg' | 'pdf';

/**
 * Export diagram to specified format
 */
export async function exportDiagram(
  element: HTMLElement,
  format: ExportFormat,
  filename: string
): Promise<void> {
  try {
    switch (format) {
      case 'png':
        await exportToPNG(element, filename);
        break;
      case 'svg':
        await exportToSVG(element, filename);
        break;
      case 'pdf':
        await exportToPDF(element, filename);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error(
      `Failed to export diagram: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Export diagram as PNG
 */
async function exportToPNG(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(element, {
    quality: 1.0,
    pixelRatio: 2, // Higher resolution
    backgroundColor: '#ffffff',
  });

  downloadFile(dataUrl, `${filename}.png`);
}

/**
 * Export diagram as SVG
 */
async function exportToSVG(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toSvg(element, {
    backgroundColor: '#ffffff',
  });

  downloadFile(dataUrl, `${filename}.svg`);
}

/**
 * Export diagram as PDF
 */
async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
  // First convert to PNG for better PDF quality
  const dataUrl = await toPng(element, {
    quality: 1.0,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });

  // Get element dimensions
  const img = new Image();
  img.src = dataUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // Calculate PDF dimensions (A4 or larger)
  const imgWidth = img.width;
  const imgHeight = img.height;
  const ratio = imgWidth / imgHeight;

  // A4 size in mm
  let pdfWidth = 210;
  let pdfHeight = 297;

  // If image is landscape or too wide, adjust
  if (ratio > pdfWidth / pdfHeight) {
    pdfHeight = pdfWidth / ratio;
  } else {
    pdfWidth = pdfHeight * ratio;
  }

  // Create PDF
  const pdf = new jsPDF({
    orientation: ratio > 1 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add image to PDF (centered)
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const x = (pageWidth - pdfWidth) / 2;
  const y = (pageHeight - pdfHeight) / 2;

  pdf.addImage(dataUrl, 'PNG', x, y, pdfWidth, pdfHeight);

  // Save PDF
  pdf.save(`${filename}.pdf`);
}

/**
 * Trigger file download
 */
function downloadFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
  link.remove();
}

/**
 * Generate filename from diagram type
 */
export function generateFilename(diagramType: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${diagramType}-diagram-${timestamp}`;
}
