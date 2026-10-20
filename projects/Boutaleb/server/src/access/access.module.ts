import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MEMBER, MemberSchema, ROLE, RoleSchema } from './member.schema.js';

// Members and roles. The guard itself is registered in AuthModule, right
// after the Clerk guard, so the order of the two is written down once.
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MEMBER, schema: MemberSchema },
            { name: ROLE, schema: RoleSchema },
        ]),
    ],
    exports: [MongooseModule],
})
export class AccessModule {}
