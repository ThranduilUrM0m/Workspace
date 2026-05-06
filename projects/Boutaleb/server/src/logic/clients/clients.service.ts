import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from '../schemas/index';

@Injectable()
export class ClientService {
  constructor(@InjectModel(Client.name) private clientModel: Model<Client>) {}

  async create(data: Partial<Client>) {
    const client = new this.clientModel(data);
    return client.save();
  }

  async findAll(skip = 0, limit = 10) {
    return this.clientModel.find().skip(skip).limit(limit).exec();
  }

  async findById(id: string) {
    return this.clientModel.findById(id).exec();
  }

  async findByEmail(email: string) {
    return this.clientModel.findOne({ email }).exec();
  }

  async update(id: string, data: Partial<Client>) {
    return this.clientModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return this.clientModel.findByIdAndDelete(id).exec();
  }
}
