import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 辅助函数：转义 HTML 实体 (保护特殊字符)
function escapeHtml(str: string) { 
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 导出的核心函数 (异步执行)
export async function exportQuizToPDF(
    quiz: any, 
    options?: { 
        title?: string, 
        showAnswers?: boolean //show answer or not
}) {
    const showAnswers = options?.showAnswers ?? true;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        alert("Tiada data kuiz untuk dieksport.");
        return;
    }

    const title = options?.title || quiz.title || "Quiz Export";
    const finalTitle = escapeHtml(title);
    const pdfHeaderTitle = showAnswers ? finalTitle : `${finalTitle} (Tanpa Jawapan)`;
    // --- 1. 构建 HTML 内容 ---
    // 使用内联样式，避免依赖外部 CSS 或 @media print
    const htmlContent = `
    <div id="pdf-content-wrapper" style="width: 210mm; padding: 20px; box-sizing: border-box; background: white;">
        <h1 style="font-size: 24px; margin-bottom: 5px; font-family: Arial, sans-serif; text-align: center;">SK SRI SIAKAP</h1>
        <h2 style="font-size: 18px; margin-bottom: 10px; font-family: Arial, sans-serif; text-align: center;">${pdfHeaderTitle}</h2>

        <div style="color: #666; margin-bottom: 15px; font-size: 14px; font-family: Arial, sans-serif;">
            Subjek: ${escapeHtml(quiz.subject || "")} | Bilangan Soalan: ${(quiz.questions || []).length}
        </div>
        
        ${ (quiz.questions || []).map((q: any, i: number) =>{ 
            // const optionsWithLabel = q.options.map((opt: string, j: number) => 
            //      `${String.fromCharCode(65 + j)}. ${opt}` // 仅在构建 HTML 时创建一次带字母的文本
            // );
            return `
            <div class="question-page" style="margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 15px; page-break-inside: avoid;">
                 <div style="margin-bottom: 8px; font-weight: bold; font-family: Arial, sans-serif;">
                    ${i + 1}. ${escapeHtml(String(q.question || ""))}
                </div>
                 <div style="margin-left: 15px;">
                 ${(q.options || []).map((opt: string, j: number) => {
                    
                    // 检查当前选项是否是答案
                    const isAnswer = j === q.answerIndex; 
                    // 根据是否是答案设置样式
                    const optionStyle = (showAnswers && isAnswer)
                        ? 'font-weight: bold; color: green; font-size: 13px;' // 👈 加粗并可选地改变颜色
                        : 'font-weight: normal; font-size: 13px;'; // 👈 普通样式
                        
                    return `
                    <div style="margin-bottom: 6px; font-family: Arial, sans-serif; ${optionStyle}"> 
                        ${String.fromCharCode(65+j)}. ${escapeHtml(String(opt || ""))}
                    </div>
                     `
                }).join('')}
                 </div>
            </div>
        `}).join('')}

    </div>
    `;

    // --- 2. 在 DOM 中创建和插入隐藏元素 ---
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '-9999px'; // 隐藏在屏幕外
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    try {
        // --- 3. 使用 html2canvas 捕获内容 ---
        const canvas = await html2canvas(element, { 
            scale: 2, // 提高分辨率
            useCORS: true, 
            width: element.offsetWidth, 
            height: element.offsetHeight 
        });

        // --- 4. 使用 jsPDF 创建和下载 PDF ---
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
        const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // 绘制第一页
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 循环添加新页并调整图像位置（多页处理）
        while (heightLeft > 0) {
            pdf.addPage();
            // position 变为负值，表示图像向上移动 (裁剪)
            position = position - pageHeight; 
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // 5. 触发下载
        pdf.save(`${finalTitle.replace(/\s/g, '_')}.pdf`);

    } catch (e) {
        console.error("PDF generation failed:", e);
        alert("Gagal menjana fail PDF.");
    } finally {
        // --- 6. 清理 DOM ---
        document.body.removeChild(element);
    }
}