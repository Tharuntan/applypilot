// Shared TypeScript models mirroring the backend DTOs.

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: UserResponse;
}

export interface Resume {
  id: number;
  title: string;
  content: string;
  primaryResume: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeRequest {
  title: string;
  content: string;
  primaryResume?: boolean;
}

export interface ResumeExtract {
  title: string;
  content: string;
}

export interface JobDescription {
  id: number;
  companyName: string;
  jobTitle: string;
  jobUrl?: string | null;
  location?: string | null;
  employmentType?: string | null;
  salaryRange?: string | null;
  descriptionText: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescriptionRequest {
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  employmentType?: string;
  salaryRange?: string;
  descriptionText: string;
}

export interface MatchReport {
  id: number;
  resumeId: number;
  resumeTitle: string;
  jobDescriptionId: number;
  companyName: string;
  jobTitle: string;
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  importantSkills: string[];
  strengths: string[];
  gaps: string[];
  suggestedSummary: string;
  optimizedBullets: string[];
  coverLetter: string;
  recruiterMessage: string;
  followUpEmail: string;
  interviewQuestions: string[];
  aiGenerated: boolean;
  createdAt: string;
}

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'RECRUITER_SCREEN'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'RECRUITER_SCREEN',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export interface JobApplication {
  id: number;
  companyName: string;
  jobTitle: string;
  jobUrl?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  applicationDate?: string | null;
  followUpDate?: string | null;
  status: ApplicationStatus;
  notes?: string | null;
  resumeId?: number | null;
  resumeTitle?: string | null;
  jobDescriptionId?: number | null;
  matchReportId?: number | null;
  matchScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationRequest {
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  salaryRange?: string;
  applicationDate?: string | null;
  followUpDate?: string | null;
  status?: ApplicationStatus;
  notes?: string;
  resumeId?: number | null;
  jobDescriptionId?: number | null;
  matchReportId?: number | null;
}

export type DocumentType =
  | 'COVER_LETTER'
  | 'RECRUITER_MESSAGE'
  | 'FOLLOW_UP_EMAIL'
  | 'THANK_YOU_EMAIL'
  | 'COLD_EMAIL';

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'COVER_LETTER', label: 'Cover Letter' },
  { value: 'RECRUITER_MESSAGE', label: 'Recruiter LinkedIn Message' },
  { value: 'FOLLOW_UP_EMAIL', label: 'Follow-up Email' },
  { value: 'THANK_YOU_EMAIL', label: 'Thank-you Email' },
  { value: 'COLD_EMAIL', label: 'Cold Email' },
];

export interface GeneratedDocument {
  id: number;
  documentType: DocumentType;
  title: string;
  content: string;
  jobApplicationId?: number | null;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateDocumentRequest {
  documentType: DocumentType;
  title?: string;
  resumeId?: number | null;
  jobDescriptionId?: number | null;
  jobApplicationId?: number | null;
  resumeText?: string;
  jobDescriptionText?: string;
  companyName?: string;
  jobTitle?: string;
}

export interface DashboardSummary {
  totalApplications: number;
  applicationsThisWeek: number;
  interviews: number;
  offers: number;
  rejections: number;
  followUpsDue: number;
  averageMatchScore: number;
  highestMatchScore: number;
  statusBreakdown: { status: string; count: number }[];
  recentMatchReports: { id: number; companyName: string; jobTitle: string; matchScore: number; createdAt: string }[];
  recentApplications: { id: number; companyName: string; jobTitle: string; status: string; createdAt: string }[];
  topMissingSkills: { skill: string; count: number }[];
}
