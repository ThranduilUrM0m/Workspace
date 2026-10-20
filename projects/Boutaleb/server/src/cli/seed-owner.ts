import { createClerkClient } from '@clerk/backend';
import mongoose from 'mongoose';
import { MEMBER, MemberSchema, ROLE, RoleSchema } from '../access/member.schema.js';

// Makes one Clerk user the owner: creates the fixed owner role if missing
// and the member that holds it. Every later person arrives by invitation
// (Settings › People, T12.3). Safe to run twice.
//
//   pnpm --filter boutaleb-server build
//   pnpm --filter boutaleb-server seed:owner user_xxx

async function main(): Promise<void> {
    const userId = process.argv[2];
    if (!userId?.startsWith('user_')) throw new Error('Usage: seed:owner <clerk user id, user_...>');
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) throw new Error('CLERK_SECRET_KEY is not set: run through infisical');

    const user = await createClerkClient({ secretKey }).users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error(`${userId} has no email address`);
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || email.split('@')[0]!;

    await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/boutaleb');
    const Role = mongoose.model(ROLE, RoleSchema);
    const Member = mongoose.model(MEMBER, MemberSchema);
    await Promise.all([Role.syncIndexes(), Member.syncIndexes()]);

    const role = await Role.findOneAndUpdate(
        { owner: true },
        { $setOnInsert: { name: 'Owner', owner: true } },
        { upsert: true, returnDocument: 'after' },
    );
    await Member.updateOne(
        { clerkUserId: userId },
        { $set: { name, email, role: role._id, status: 'active' }, $unset: { revokedAt: 1 } },
        { upsert: true },
    );
    console.log(`Owner: ${name} <${email}> (${userId})`);
    await mongoose.disconnect();
}

main().catch(async (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    await mongoose.disconnect();
    process.exit(1);
});
