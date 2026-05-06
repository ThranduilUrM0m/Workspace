import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { ContactSubmission, ContactSubmissionSchema } from '../../schemas/index';

@Module({
  imports: [MongooseModule.forFeature([{ name: ContactSubmission.name, schema: ContactSubmissionSchema }])],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
