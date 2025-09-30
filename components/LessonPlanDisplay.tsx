
import React, { useMemo, useState } from 'react';
import Loader from './Loader';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface LessonPlanDisplayProps {
  content: string;
  isLoading: boolean;
}

const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ content, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formattedContent = useMemo(() => {
    if (!content) return '';
    // Cập nhật để các đề mục nổi bật hơn: lớn hơn, đậm hơn và có khoảng cách
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-lg text-black block mt-3 mb-1">$1</strong>')
      .replace(/\n/g, '<br />');
  }, [content]);

  const handleCopy = () => {
    // Create a temporary element to hold the plain text for copying
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content.replace(/\*\*/g, ''); // Remove markdown for plain text copy
    navigator.clipboard.writeText(tempDiv.textContent || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportWord = async () => {
    if (!content) return;
    setIsExporting(true);

    try {
        const paragraphs = content.split('\n').map(line => {
            const children: TextRun[] = [];
            // Phân tách dòng theo dấu ** để xác định phần in đậm
            const parts = line.split('**');

            parts.forEach((part, index) => {
                if (part) { // Bỏ qua các chuỗi rỗng
                    children.push(
                        new TextRun({
                            text: part,
                            bold: index % 2 === 1, // Các phần tử ở chỉ số lẻ là phần in đậm
                            size: 28, // Cỡ chữ 14pt (14 * 2)
                        })
                    );
                }
            });
            
            // Nếu dòng trống, tạo một đoạn văn trống để giữ khoảng cách
            if (children.length === 0 && line === '') {
                return new Paragraph({ children: [new TextRun({ text: '', size: 28 })] });
            }

            return new Paragraph({ children });
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs,
            }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'giao-an.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error exporting to Word:", error);
        alert("Đã có lỗi xảy ra khi xuất tệp Word.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="relative h-full min-h-[400px] border border-gray-200 rounded-md p-4 bg-gray-50 overflow-y-auto">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center">
          <Loader />
          <p className="mt-4 text-gray-600">AI đang soạn giáo án, vui lòng chờ...</p>
        </div>
      )}

      {!isLoading && !content && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <i className="fas fa-list-alt fa-4x mb-4"></i>
            <p className="font-medium">Chọn một giáo án từ danh sách để xem nội dung.</p>
            <p className="text-sm mt-1">Hoặc tạo một giáo án mới.</p>
        </div>
      )}

      {content && (
        <>
          <div className="absolute top-2 right-2 flex space-x-2 z-10">
             <button
              onClick={handleExportWord}
              disabled={isExporting}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-md text-sm transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="Xuất ra tệp Word"
            >
              {isExporting ? (
                 <div className="w-4 h-4 border-2 border-t-transparent border-gray-700 rounded-full animate-spin"></div>
              ) : (
                <>
                  <i className="fas fa-file-word mr-2 text-blue-600"></i>
                  <span>Xuất Word</span>
                </>
              )}
            </button>
            <button 
              onClick={handleCopy}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-md text-sm transition-colors flex items-center justify-center"
              aria-label="Sao chép nội dung"
            >
              <i className={`fas ${copied ? 'fa-check text-green-500' : 'fa-copy'} mr-2`}></i>
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>
          <div
            className="prose max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </>
      )}
    </div>
  );
};

export default LessonPlanDisplay;