export interface SaveFileResponse {
  success: boolean;
  file_name?: string | null;
  preserved_explanations?: boolean;
  error?: string;
}

export interface FileInfoResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface ConceptExplanation {
  concept: string;
  explanation: string;
  tag: string;
}

export interface ConceptExplanationsResponse {
  success: boolean;
  explanation?: string;
  tag?: string;
  error?: string;
  explanations?: ConceptExplanation[];
}

export interface ImageUploadResponse {
  success: boolean;
  url: string | null;
  error: string | null;
}