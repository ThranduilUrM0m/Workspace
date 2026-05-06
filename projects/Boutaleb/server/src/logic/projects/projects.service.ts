import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../schemas/index';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  async create(data: Partial<Project>) {
    const project = new this.projectModel(data);
    return project.save();
  }

  async findAll(skip = 0, limit = 10) {
    return this.projectModel.find().skip(skip).limit(limit).exec();
  }

  async findById(id: string) {
    return this.projectModel.findById(id).exec();
  }

  async findBySlug(slug: string) {
    return this.projectModel.findOne({ slug }).exec();
  }

  async findByClientId(clientId: string) {
    return this.projectModel.find({ clientId }).exec();
  }

  async update(id: string, data: Partial<Project>) {
    return this.projectModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return this.projectModel.findByIdAndDelete(id).exec();
  }
}
