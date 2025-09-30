import React, { useState, useCallback, useEffect } from 'react';
import { generateLessonPlan } from './services/geminiService';
import FileUpload from './components/FileUpload';
import LessonPlanDisplay from './components/LessonPlanDisplay';
import Loader from './components/Loader';
import LessonPlanList from './components/LessonPlanList';
import { FileInfo, LessonPlan } from './types';
import { extractTextFromFile } from './utils/fileProcessor';

const App: React.FC = () => {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [duration, setDuration] = useState('45 phút');

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => {
    try {
      const savedPlans = localStorage.getItem('lessonPlans');
      return savedPlans ? JSON.parse(savedPlans) : [];
    } catch (error) {
      console.error("Không thể tải giáo án từ localStorage", error);
      return [];
    }
  });
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('lessonPlans', JSON.stringify(lessonPlans));
    } catch (error) {
       console.error("Không thể lưu giáo án vào localStorage", error);
    }
  }, [lessonPlans]);

  const selectedPlan = lessonPlans.find(p => p.id === selectedPlanId) || null;

  const handleFileChange = async (file: File) => {
    setIsParsing(true);
    setError('');
    setFileInfo(null);
    try {
      const content = await extractTextFromFile(file);
      setFileInfo({
        name: file.name,
        content: content,
      });
    } catch (err) {
       setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xử lý tệp.');
       console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!fileInfo) {
      setError('Vui lòng tải lên một tệp mẫu.');
      return;
    }
    if (!topic || !subject || !grade) {
      setError('Vui lòng điền đầy đủ các thông tin: Môn học, Lớp, và Tên bài học.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const planContent = await generateLessonPlan({
        topic,
        subject,
        grade,
        duration,
        templateContent: fileInfo.content,
      });

      const newPlan: LessonPlan = {
        id: Date.now().toString(),
        name: topic || `Giáo án mới ${lessonPlans.length + 1}`,
        content: planContent,
      };

      setLessonPlans(prevPlans => [...prevPlans, newPlan]);
      setSelectedPlanId(newPlan.id);

    } catch (err) {
      setError(err instanceof Error ? `Lỗi: ${err.message}` : 'Đã xảy ra lỗi không xác định. Vui lòng kiểm tra API Key và thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fileInfo, topic, subject, grade, duration, lessonPlans.length]);
  
  const handleSelectPlan = (id: string) => {
    setSelectedPlanId(id);
  };

  const handleUpdatePlanName = (id: string, newName: string) => {
    setLessonPlans(plans =>
      plans.map(p => (p.id === id ? { ...p, name: newName.trim() } : p))
    );
  };

  const handleDeletePlan = (id: string) => {
    const updatedPlans = lessonPlans.filter(p => p.id !== id);
    setLessonPlans(updatedPlans);
    if (selectedPlanId === id) {
      setSelectedPlanId(updatedPlans.length > 0 ? updatedPlans[0].id : null);
    }
  };

  const handleClearAllPlans = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa TẤT CẢ các giáo án đã lưu không? Hành động này không thể hoàn tác.')) {
        setLessonPlans([]);
        setSelectedPlanId(null);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">
            <i className="fas fa-magic-wand-sparkles mr-2"></i>
            SOẠN GIÁO ÁN AI
          </h1>
          <a href="https://github.com/google/generative-ai-docs" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors">
             <i className="fab fa-github fa-2x"></i>
          </a>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">1. Nhập thông tin giáo án</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Môn học (ví dụ: Ngữ Văn)" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"/>
              <input type="text" placeholder="Lớp (ví dụ: Lớp 10)" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"/>
            </div>
            <input type="text" placeholder="Tên bài học / Chủ đề" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"/>
            <input type="text" placeholder="Thời lượng (ví dụ: 45 phút)" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"/>
            
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 pt-4">2. Tải lên tệp mẫu</h2>
            <FileUpload onFileSelect={handleFileChange} isParsing={isParsing} />

            <button
              onClick={handleGenerate}
              disabled={isLoading || isParsing}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <i className="fas fa-cogs"></i>
                  <span>Tạo giáo án</span>
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </div>

          
          <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-800">Danh sách giáo án đã tạo</h2>
                 {lessonPlans.length > 0 && (
                    <button
                        onClick={handleClearAllPlans}
                        className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline flex items-center space-x-1"
                        aria-label="Xóa tất cả các giáo án"
                    >
                        <i className="fas fa-times-circle"></i>
                        <span>Xóa tất cả</span>
                    </button>
                 )}
              </div>
              <LessonPlanList
                plans={lessonPlans}
                selectedPlanId={selectedPlanId}
                onSelect={handleSelectPlan}
                onUpdateName={handleUpdatePlanName}
                onDelete={handleDeletePlan}
              />
          </div>
        
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Kết quả giáo án</h2>
          <LessonPlanDisplay content={selectedPlan?.content ?? ''} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default App;