export interface Section {
  section_id: string | number;
  title: string;
  content_points?: string[];
  learning_goals: string[];
  status: 'waiting' | 'text_complete' | 'complete';
}

export interface SectionResponse {
  success: boolean;
  sections?: Section[];
  error?: string;
}

export interface MarkdownViewerProps {
  markdownContent: string;
  isComplete: boolean;
  userId: string;
  conversationId: string;
  isArchiveView: boolean;
  onBackClick: () => void;
  isLoading?: boolean;
}