export interface FileInfo {
  name: string;
  content: string;
}

export interface GenerationParams {
  topic: string;
  subject: string;
  grade: string;
  duration: string;
  templateContent: string;
}

export interface LessonPlan {
  id: string;
  name: string;
  content: string;
}
