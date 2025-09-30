import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.min.mjs';
import mammoth from 'mammoth';

// Thiết lập đường dẫn worker cho pdf.js từ CDN
// Cách tiếp cận trước đây sử dụng new URL(...) không chính xác vì 'pdfjs-dist/...' không phải là một đường dẫn tương đối hợp lệ.
// Cung cấp URL đầy đủ, tuyệt đối từ CDN sẽ khắc phục lỗi "Invalid URL".
GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

export async function extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === 'application/pdf') {
        const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n\n';
        }
        return text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // .docx
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } else if (file.type === 'text/plain') { // .txt
        return file.text();
    } else {
        throw new Error(`Định dạng tệp không được hỗ trợ: ${file.name}. Vui lòng sử dụng DOCX, PDF, hoặc TXT.`);
    }
}