import { jsPDF } from 'jspdf';

/**
 * Generate and download a clean, paginated PDF from a title + body text.
 * Used for cover letters, recruiter messages, optimized resumes, etc.
 */
export function downloadTextPdf(title: string, body: string, fileName?: string): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const marginX = 56; // ~0.78"
  const marginTop = 64;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginX * 2;
  let y = marginTop;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  for (const line of doc.splitTextToSize(title || 'Document', usableWidth)) {
    doc.text(line, marginX, y);
    y += 20;
  }
  y += 8;

  // Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const lineHeight = 16;
  const paragraphs = (body || '').replace(/\r\n/g, '\n').split('\n');

  for (const para of paragraphs) {
    const lines = para.length ? doc.splitTextToSize(para, usableWidth) : [''];
    for (const line of lines) {
      if (y > pageHeight - marginTop) {
        doc.addPage();
        y = marginTop;
      }
      doc.text(line, marginX, y);
      y += lineHeight;
    }
  }

  const safe = (fileName || title || 'document')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  doc.save(`${safe || 'document'}.pdf`);
}
