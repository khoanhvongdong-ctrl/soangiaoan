
import React from 'react';
import { LessonPlan } from '../types.ts';
import LessonPlanListItem from './LessonPlanListItem.tsx';

interface LessonPlanListProps {
  plans: LessonPlan[];
  selectedPlanId: string | null;
  onSelect: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

const LessonPlanList: React.FC<LessonPlanListProps> = ({ plans, selectedPlanId, onSelect, onUpdateName, onDelete }) => {
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="overflow-y-auto max-h-96 pr-2 -mr-2">
      <ul className="space-y-2">
        {plans.map(plan => (
          <LessonPlanListItem
            key={plan.id}
            plan={plan}
            isSelected={plan.id === selectedPlanId}
            onSelect={onSelect}
            onUpdateName={onUpdateName}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default LessonPlanList;