export function exportQuizToPDF(quiz: any, options?: { title?: string }) {
  if (!quiz) return;
  const title = options?.title || quiz.title || "Quiz Export";
  // Build HTML with page breaks (one question per page)
  const content = `
  <html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      @media print {
        body { font-family: Arial, sans-serif; margin: 20mm; color: #222; }
        .page { page-break-after: always; width: 100%; }
      }
      body { font-family: Arial, sans-serif; margin: 8mm; color: #222; }
      h1 { font-size: 20px; margin-bottom: 8px; }
      .meta { color: #666; margin-bottom: 12px; }
      .question { margin-bottom: 8px; font-weight: bold; }
      .option { margin-left: 18px; margin-bottom: 6px; }
      .footer { position: absolute; bottom: 12px; font-size: 11px; color: #666; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <div class="meta">Subject: ${quiz.subject || ""} | Generated: ${new Date(
      quiz.createdAt || Date.now()
    ).toLocaleString()}</div>

    ${ (quiz.questions || []).map((q: any, i: number) => `
      <div class="page">
        <div class="question">${i + 1}. ${escapeHtml(String(q.question || ""))}</div>
        ${(q.options || []).map((opt: string, j: number) => `
          <div class="option">${String.fromCharCode(65+j)}. ${escapeHtml(String(opt || ""))}</div>
        `).join('')}
        <div class="footer">Page ${i + 1} / ${quiz.questions.length}</div>
      </div>
    `).join('')}

  </body>
  </html>
  `;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    alert("Popup blocked — enable popups for this site to export PDF.");
    return;
  }
  w.document.open();
  w.document.write(content);
  w.document.close();
  // give browser a bit time to render before print
  setTimeout(() => w.print(), 500);
}

// small helper to avoid breaking HTML
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}