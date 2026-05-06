import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost } from '../schemas/index';

@Injectable()
export class BlogService {
  constructor(@InjectModel(BlogPost.name) private blogModel: Model<BlogPost>) {}

  async create(data: Partial<BlogPost>) {
    const post = new this.blogModel(data);
    return post.save();
  }

  async findAll(skip = 0, limit = 10) {
    return this.blogModel.find().skip(skip).limit(limit).exec();
  }

  async findBySlug(slug: string) {
    return this.blogModel.findOne({ slug }).exec();
  }

  async findFeatured(limit = 3) {
    return this.blogModel.find({ featured: true }).limit(limit).exec();
  }

  async findByTag(tag: string, limit = 10) {
    return this.blogModel.find({ tags: tag }).limit(limit).exec();
  }

  async update(id: string, data: Partial<BlogPost>) {
    return this.blogModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return this.blogModel.findByIdAndDelete(id).exec();
  }
}
