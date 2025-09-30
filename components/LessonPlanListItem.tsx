import React, { useState, useRef, useEffect } from 'react';
import { LessonPlan } from '../types';

interface LessonPlanListItemProps {
  plan: LessonPlan;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

const LessonPlanListItem: React.FC<LessonPlanListItemProps> = ({ plan, isSelected, onSelect, onUpdateName, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(plan.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim()) {
      onUpdateName(plan.id, name.trim());
    } else {
      setName(plan.name); // revert if empty
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(plan.name);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selection when deleting
    if (window.confirm(`Bạn có chắc muốn xóa giáo án "${plan.name}" không?`)) {
      onDelete(plan.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selection when clicking edit
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li
      className={`p-3 rounded-md border transition-all duration-200 flex items-center justify-between ${
        isSelected
          ? 'bg-blue-100 border-blue-400 shadow-sm'
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      } ${isEditing ? '' : 'cursor-pointer'}`}
      onClick={() => !isEditing && onSelect(plan.id)}
    >
      {isEditing ? (
        <div className="flex-grow flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-1 border border-blue-400 rounded-md focus:ring-1 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()} // Prevent li's onClick
          />
          <button onClick={handleSave} className="text-green-600 hover:text-green-800 p-1"><i className="fas fa-check"></i></button>
          <button onClick={handleCancel} className="text-red-600 hover:text-red-800 p-1"><i className="fas fa-times"></i></button>
        </div>
      ) : (
        <>
          <span className="font-medium text-gray-700 truncate mr-2">{plan.name}</span>
          <div className="flex items-center space-x-3 ml-auto flex-shrink-0">
            <button onClick={handleEdit} className="text-gray-500 hover:text-blue-600 transition-colors" aria-label={`Sửa tên giáo án ${plan.name}`}>
              <i className="fas fa-pencil-alt fa-sm"></i>
            </button>
            <button onClick={handleDelete} className="text-gray-500 hover:text-red-600 transition-colors" aria-label={`Xóa giáo án ${plan.name}`}>
              <i className="fas fa-trash-alt fa-sm"></i>
            </button>
          </div>
        </>
      )}
    </li>
  );
};

export default LessonPlanListItem;
