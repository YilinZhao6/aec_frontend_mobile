export interface SearchParams {
  query: string;
  conceptFamiliarity: number;
  referenceBook?: File;
  additionalComments?: string;
  selectedBooks?: string[];
}

export interface OnboardingState {
  language: 'en' | 'zh';
  source: string;
  referralCode: string;
  preferences: {
    education: {
      level: string[];
      institution: string;
      field_of_study: string;
    };
    learning_styles: string[];
    additional_preferences: string;
  };
}