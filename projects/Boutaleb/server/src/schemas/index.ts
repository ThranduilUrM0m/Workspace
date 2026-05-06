import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  type: 'tutorial' | 'deep-dive' | 'note' | 'case-study';
  tags: string[];
  author?: string;
  featured?: boolean;
  publishedAt?: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);

@Schema({ timestamps: true })
export class Client extends Document {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  website?: string;
  status: 'lead' | 'active' | 'inactive';
}

export const ClientSchema = SchemaFactory.createForClass(Client);

@Schema({ timestamps: true })
export class Project extends Document {
  clientId: string;
  name: string;
  slug: string;
  status: 'intake_pending' | 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  progressPct: number;
  erpModules: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

@Schema({ timestamps: true })
export class ContactSubmission extends Document {
  fullName: string;
  email: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  projectSummary: string;
  assetsUrl?: string;
  status: 'received' | 'under_review' | 'responded';
}

export const ContactSubmissionSchema = SchemaFactory.createForClass(ContactSubmission);
