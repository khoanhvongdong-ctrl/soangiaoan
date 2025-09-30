
import React, { useState, useCallback, useRef } from 'react';
import Loader from './Loader.tsx';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isParsing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isParsing }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null) => {
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/pdf' || file.type === 'text/plain') {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        alert("Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .docx, .pdf, hoặc .txt");
      }
    }
  }, [onFileSelect]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileClick = () => {
    if (!isParsing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Also inform parent component to clear file info
    // This is a bit tricky, maybe the parent should handle clearing.
    // For now, this just clears the UI here.
    // A better approach would be for the parent to pass down a clear function or null fileInfo.
  };

  return (
    <div>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleFileClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${isParsing ? 'cursor-wait bg-gray-100' : 'cursor-pointer hover:border-blue-400'}`}
      >
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.txt"
            disabled={isParsing}
        />
        <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
            <i className="fas fa-cloud-upload-alt fa-3x"></i>
            <p className="font-semibold">Kéo và thả tệp vào đây</p>
            <p className="text-sm">hoặc <span className="text-blue-600 font-medium">nhấn để chọn tệp</span></p>
            <p className="text-xs text-gray-400 mt-2">Hỗ trợ: DOCX, PDF, TXT</p>
        </div>
      </div>
      {isParsing && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded-md text-sm flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            <span>Đang xử lý tệp...</span>
        </div>
      )}
      {fileName && !isParsing && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            <i className="fas fa-file-alt text-blue-500 flex-shrink-0"></i>
            <span className="font-medium truncate">{fileName}</span>
          </div>
          <button onClick={clearFile} className="text-red-500 hover:text-red-700 ml-2">
            <i className="fas fa-times-circle"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;