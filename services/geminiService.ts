
import { GoogleGenAI } from "@google/genai";
import { GenerationParams } from '../types.ts';

const API_KEY = process.env.API_KEY;

// Khởi tạo AI client. Lỗi thiếu API key sẽ được xử lý bên trong hàm gọi API,
// cho phép giao diện người dùng của ứng dụng tải lên một cách bình thường.
const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildPrompt = (params: GenerationParams): string => {
  return `
    Với vai trò là một chuyên gia về chương trình giáo dục Việt Nam, hãy soạn một giáo án chi tiết.

    **Dưới đây là nội dung văn bản được trích xuất từ tệp mẫu để bạn tham khảo cấu trúc và các ý chính:**
    --- BẮT ĐẦU NỘI DUNG TỆP MẪU ---
    ${params.templateContent}
    --- KẾT THÚC NỘI DUNG TỆP MẪU ---

    **Yêu cầu:**
    1.  **Dựa vào cấu trúc và ý chính từ nội dung tệp mẫu trên.**
    2.  **Soạn giáo án cho:**
        *   **Môn học:** ${params.subject}
        *   **Lớp:** ${params.grade}
        *   **Tên bài học:** ${params.topic}
        *   **Thời lượng:** ${params.duration}
    3.  **Định dạng:**
        *   Tuân thủ nghiêm ngặt thể thức văn bản hành chính của Việt Nam (ví dụ: Tiêu đề, căn lề, mục lớn, mục nhỏ).
        *   **In đậm BẮT BUỘC:** Tất cả các đề mục, tiêu đề chính, tiêu đề phụ, các mục La Mã (ví dụ: **I.**, **II.**), và các từ khóa như **Hoạt động 1**, **Nhiệm vụ**. Sử dụng cú pháp Markdown (ví dụ: **I. MỤC TIÊU**).
        *   **TUYỆT ĐỐI KHÔNG sử dụng dấu hoa thị (*)** ở bất kỳ đâu trong văn bản. Chỉ cần xuống dòng cho mỗi mục.
    4.  **Nội dung:**
        *   Nội dung phải logic, khoa học, phù hợp với trình độ học sinh và mục tiêu bài học.
        *   Các hoạt động dạy và học phải được thiết kế rõ ràng, sáng tạo.
    
    Hãy bắt đầu soạn giáo án.
    `;
};

export const generateLessonPlan = async (params: GenerationParams): Promise<string> => {
    try {
        if (!API_KEY) {
            throw new Error("API Key chưa được cấu hình. Vui lòng đảm bảo biến môi trường API_KEY đã được thiết lập.");
        }

        const prompt = buildPrompt(params);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let text = response.text;
        if (!text) {
            throw new Error("API không trả về nội dung. Vui lòng thử lại.");
        }
        
        // Dọn dẹp tất cả các dấu * mà AI có thể vẫn tạo ra để đảm bảo kết quả sạch sẽ.
        text = text.replace(/\*/g, '');

        return text;

    } catch (error) {
        console.error("Error generating lesson plan with Gemini:", error);
        if (error instanceof Error) {
            // Re-throw with a more user-friendly message
            throw new Error(`Lỗi khi gọi Gemini API: ${error.message}`);
        }
        throw new Error("Lỗi không xác định từ Gemini API.");
    }
};