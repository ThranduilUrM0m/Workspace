import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactSubmission } from '../schemas/index';

@Injectable()
export class ContactService {
  constructor(@InjectModel(ContactSubmission.name) private contactModel: Model<ContactSubmission>) {}

  async submitIntake(data: Partial<ContactSubmission>) {
    const submission = new this.contactModel({
      ...data,
      status: 'received',
    });
    return submission.save();
  }

  async findById(id: string) {
    return this.contactModel.findById(id).exec();
  }

  async findAll(skip = 0, limit = 10) {
    return this.contactModel.find().skip(skip).limit(limit).exec();
  }

  async updateStatus(id: string, status: string) {
    return this.contactModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}
