import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Helper to escape HTML characters
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function downloadFlashcardPDF(data: any, options?: { title?: string }) {
  // Check for valid data (supports both direct array or object with flashcards property)
  const cards = Array.isArray(data) ? data : (data.flashcards || []);
  
  if (!cards || cards.length === 0) {
    alert("Tiada data kad imbas untuk dieksport.");
    return;
  }
  
  const SCHOOL_LOGO_URL = "/SKSRISIAKAP.png";
  const title = options?.title || data.title || "Flashcards";
  const finalTitle = escapeHtml(title);
  const subject = data.subject ? escapeHtml(data.subject) : "";

  // --- Build HTML Content ---
  // We create a grid layout (2 columns) suitable for printing and cutting
  const htmlContent = `
    <div id="pdf-flashcard-wrapper" style="width: 210mm; padding: 15mm; box-sizing: border-box; background: white; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 8px;">
            <img 
                src="${SCHOOL_LOGO_URL}" 
                alt="Logo Sekolah"
                style="max-width: 80px; height: auto; display: block; margin: 0 auto;"
                onerror="this.style.display='none';" 
            />
        </div>
      <h1 style="font-size: 24px; margin-bottom: 5px; font-family: Arial, sans-serif; text-align: center;">SK SRI SIAKAP</h1>  
      <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 24px; margin: 0;">${finalTitle}</h1>
            <p style="color: #666; margin: 5px 0;">${subject} | ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between;">
            ${cards.map((card: any, i: number) => `
                <div style="
                    width: 48%; 
                    border: 2px dashed #ccc; 
                    border-radius: 8px; 
                    padding: 15px; 
                    box-sizing: border-box; 
                    margin-bottom: 15px;
                    page-break-inside: avoid;
                    background-color: #f9f9f9;
                ">
                    <div style="font-size: 12px; color: #999; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">
                        Kad #${i + 1}
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-size: 11px; color: #555; font-weight: bold;">Soalan:</div>
                        <div style="font-size: 14px; margin-top: 4px; color: #000;">${escapeHtml(card.front)}</div>
                    </div>
                    
                    <div style="border-top: 1px solid #ddd; padding-top: 10px;">
                        <div style="font-size: 11px; color: #555; font-weight: bold;">Jawapan:</div>
                        <div style="font-size: 14px; margin-top: 4px; color: #000; font-weight: bold;">${escapeHtml(card.back)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
  `;

  // --- Create Hidden DOM Element ---
  const element = document.createElement('div');
  element.style.position = 'absolute';
  element.style.top = '-9999px';
  element.innerHTML = htmlContent;
  document.body.appendChild(element);

  try {
    // --- Generate PDF ---
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      windowWidth: 1000 // Force width to ensure grid renders correctly
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Flashcards_${finalTitle.replace(/\s/g, '_')}.pdf`);

  } catch (error) {
    console.error("PDF Export Error:", error);
    alert("Gagal menjana PDF.");
  } finally {
    document.body.removeChild(element);
  }
}