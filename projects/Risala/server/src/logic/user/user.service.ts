import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOrCreate(userData: Partial<User>): Promise<UserDocument> {
    let user = await this.userModel.findOne({ clerkId: userData.clerkId });
    if (!user) {
      user = new this.userModel(userData);
      await user.save();
    }
    return user;
  }

  async findByClerkId(clerkId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ clerkId });
  }

  async updateUser(clerkId: string, updateData: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate({ clerkId }, updateData, { new: true });
  }

  async deleteUser(clerkId: string): Promise<void> {
    await this.userModel.deleteOne({ clerkId });
  }
}
