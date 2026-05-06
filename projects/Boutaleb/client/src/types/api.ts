export interface ContactFormData {
  fullName: string;
  email: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  projectSummary: string;
  assetsUrl?: string;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  company?: string;
  role?: 'client' | 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  status: 'intake_pending' | 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  progressPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostType {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author?: string;
  type: 'tutorial' | 'deep-dive' | 'note' | 'case-study';
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
