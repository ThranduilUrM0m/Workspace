import { createHash, randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { BRIEF, BriefSchema } from '../briefs/brief.schema.js';
import { CLIENT, ClientSchema } from '../clients/client.schema.js';
import { PROJECT, ProjectSchema } from '../projects/project.schema.js';
import { PORTAL_LINK, PortalLinkSchema } from '../portal/portal-link.schema.js';

// The live portal smoke (client e2e/portal.live.spec.ts) needs a working
// magic link on a real project in the real API's database. This makes one
// on the LOCAL demo project and prints the token, nothing else, on stdout.
//
// It resets that project's brief to "awaiting" with no answers and replaces
// its link, so it refuses any database that is not on this machine.
//
//   pnpm --filter boutaleb-server build
//   cd server; infisical run --silent -- node --conditions=boutaleb-node dist/cli/smoke-portal-link.js ["Project name"]

async function main(): Promise<void> {
    const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/boutaleb';
    const host = uri.replace(/^mongodb(\+srv)?:\/\/([^@/]*@)?/, '').split(/[/:,?]/)[0];
    if (host !== '127.0.0.1' && host !== 'localhost') throw new Error(`refusing: ${host} is not this machine's database`);

    const name = process.argv[2] ?? 'Riad Nozha site (demo)';
    await mongoose.connect(uri);
    const Projects = mongoose.model(PROJECT, ProjectSchema);
    const Clients = mongoose.model(CLIENT, ClientSchema);
    const Briefs = mongoose.model(BRIEF, BriefSchema);
    const Links = mongoose.model(PORTAL_LINK, PortalLinkSchema);

    const p = await Projects.findOne({ name, archivedAt: null }).lean();
    if (!p) throw new Error(`no live project named "${name}"`);
    const c = p.client ? await Clients.findById(p.client).lean() : null;
    if (!c || c.self) throw new Error(`"${name}" has no outside client: a link would open nothing`);
    if (p.status === 'completed') throw new Error(`"${name}" is completed: a link would open nothing`);

    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    await Links.updateOne(
        { project: p._id },
        { $set: { hash: createHash('sha256').update(token).digest('hex'), resentHash: null, issuedAt: now, emailedAt: null, lastOpenDay: null } },
        { upsert: true },
    );
    await Briefs.updateOne({ project: p._id }, { $set: { state: 'awaiting', sentAt: now, draft: [] } }, { upsert: true });
    await mongoose.disconnect();
    process.stdout.write(token);
}

main().catch(async (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    await mongoose.disconnect();
    process.exit(1);
});
