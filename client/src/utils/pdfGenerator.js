import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Downloads a clean 2-page print-ready PDF:
 * - Page 1: Front of the ID Card
 * - Page 2: Back of the ID Card
 * 
 * Calibrated strictly to ISO/IEC 7810 ID-1 standard portrait dimensions:
 * Width: 54 mm, Height: 86 mm.
 */
export async function downloadIDCardPDF(frontElement, backElement, filename = 'ID-Card.pdf', orientation = 'portrait') {
  if (!frontElement || !backElement) {
    throw new Error('Target card elements were not found.');
  }

  // Exact ID card dimensions in millimeters
  const isLandscape = orientation === 'landscape';
  const cardWidthMM = isLandscape ? 86 : 54;
  const cardHeightMM = isLandscape ? 54 : 86;
  const pixelWidth = isLandscape ? 516 : 324;
  const pixelHeight = isLandscape ? 324 : 516;

  try {
    const canvasOptions = {
      scale: 3, // 300 DPI high-definition print quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: pixelWidth,
      height: pixelHeight,
    };

    // 1. Capture Front Side Canvas
    const canvasFront = await html2canvas(frontElement, canvasOptions);
    const imgFront = canvasFront.toDataURL('image/jpeg', 0.98);

    // 2. Capture Back Side Canvas
    const canvasBack = await html2canvas(backElement, canvasOptions);
    const imgBack = canvasBack.toDataURL('image/jpeg', 0.98);

    // 3. Generate 2-Page Portrait PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [cardWidthMM, cardHeightMM],
    });

    // Page 1: Front
    pdf.addImage(imgFront, 'JPEG', 0, 0, cardWidthMM, cardHeightMM, undefined, 'FAST');

    // Page 2: Back
    pdf.addPage([cardWidthMM, cardHeightMM], orientation);
    pdf.addImage(imgBack, 'JPEG', 0, 0, cardWidthMM, cardHeightMM, undefined, 'FAST');

    // Save PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

/**
 * Downloads two separate clean JPG images:
 * - StudentID-[RollNo]-Front.jpg
 * - StudentID-[RollNo]-Back.jpg
 */
export async function downloadIDCardJPGs(frontElement, backElement, rollNumber = 'Holder', orientation = 'portrait') {
  if (!frontElement || !backElement) {
    throw new Error('Target card elements were not found.');
  }

  try {
    const saveCanvasJPG = (canvas, filename) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/jpeg', 0.98);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const canvasOptions = {
      scale: 3, // 300 DPI high-definition print quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: orientation === 'landscape' ? 516 : 324,
      height: orientation === 'landscape' ? 324 : 516,
    };

    // 1. Front JPG
    const canvasFront = await html2canvas(frontElement, canvasOptions);
    saveCanvasJPG(canvasFront, `StudentID-${rollNumber}-Front.jpg`);

    // 2. Back JPG (small timeout for browser download handling)
    setTimeout(async () => {
      const canvasBack = await html2canvas(backElement, canvasOptions);
      saveCanvasJPG(canvasBack, `StudentID-${rollNumber}-Back.jpg`);
    }, 350);

    return true;
  } catch (error) {
    console.error('JPG generation error:', error);
    throw error;
  }
}
