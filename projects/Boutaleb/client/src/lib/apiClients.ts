import { apiService, ApiResponse } from './api';

export interface ContactSubmission {
  fullName: string;
  email: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  projectSummary: string;
  assetsUrl?: string;
}

export interface ContactResponse {
  id: string;
  status: 'received' | 'under_review' | 'responded';
  submittedAt: string;
}

export const contactApi = {
  async submitIntake(data: ContactSubmission): Promise<ApiResponse<ContactResponse>> {
    return apiService.post<ContactResponse>('/api/public/contact/submit', data);
  },

  async getContactStatus(id: string): Promise<ApiResponse<ContactResponse>> {
    return apiService.get<ContactResponse>(`/api/public/contact/${id}`);
  }
};

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  type: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const blogApi = {
  async getFeaturedPosts(limit = 3): Promise<ApiResponse<BlogPost[]>> {
    return apiService.get<BlogPost[]>(`/api/public/blog/featured?limit=${limit}`);
  },

  async getPostBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    return apiService.get<BlogPost>(`/api/public/blog/${slug}`);
  },

  async getPosts(params?: { tag?: string; type?: string; limit?: number; offset?: number }): Promise<ApiResponse<BlogPost[]>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    ).toString();
    return apiService.get<BlogPost[]>(`/api/public/blog?${queryString}`);
  }
};

export interface ProjectCase {
  id: string;
  slug: string;
  title: string;
  clientType: string;
  industry: string;
  year: number;
  role: string;
  summary: string;
  problem: string;
  process: string;
  solution: string;
  resultMetric: string;
  tags: string[];
  coverImage: string;
  screens: Array<{ label: string; image: string }>;
}

export const projectsApi = {
  async getFeaturedProjects(limit = 6): Promise<ApiResponse<ProjectCase[]>> {
    return apiService.get<ProjectCase[]>(`/api/public/projects/featured?limit=${limit}`);
  },

  async getProjectBySlug(slug: string): Promise<ApiResponse<ProjectCase>> {
    return apiService.get<ProjectCase>(`/api/public/projects/${slug}`);
  },

  async getProjects(params?: { industry?: string; module?: string; year?: string; search?: string }): Promise<ApiResponse<ProjectCase[]>> {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    ).toString();
    return apiService.get<ProjectCase[]>(`/api/public/projects?${queryString}`);
  }
};
