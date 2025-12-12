export interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  hash: string;
  aiStatus: 'Processed' | 'Queued' | 'Failed';
  verificationStatus: 'Verified' | 'Mining';
  type: 'pdf' | 'doc' | 'image' | 'sheet';
  // New fields for Insights
  category: string;
  summary?: string;
  validity?: string; // e.g., "Expires on Dec 31, 2024"
  url?: string; // URL to the file in the bucket
}

export interface Stat {
  label: string;
  value: string;
  change: string; // e.g., "+12%"
  icon: string;
}

export type ViewState = 'dashboard' | 'upload' | 'analytics' | 'insights' | 'settings';

export type NavItem = {
  id: ViewState;
  label: string;
  icon: string;
}