// Frees the dev port from a leftover dev server of THIS repo before
// `next dev` starts. When the shell running `next dev` is killed (Claude
// Code's low-memory stop, a closed terminal), Windows does not kill the
// process tree: Next's server keeps the port and answers 500s, and the next
// `next dev` dies on EADDRINUSE.
// Not kill-port: that kills whatever holds the port. This only stops a
// process whose command line is Next's server inside this repo, and
// otherwise says who has the port and stops.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const port = process.argv[2];
const repo = path.resolve(fileURLToPath(import.meta.url), '../../../../..').toLowerCase();
const isWindows = process.platform === 'win32';
const run = (cmd, args) => {
    try {
        return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
        return '';
    }
};

function listeners() {
    if (isWindows) {
        const pids = run('netstat', ['-ano', '-p', 'TCP'])
            .split('\n')
            .map((l) => l.trim().split(/\s+/))
            .filter((c) => c[3] === 'LISTENING' && c[1]?.endsWith(`:${port}`))
            .map((c) => c[4]);
        return [...new Set(pids)];
    }
    return run('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN']).split('\n').filter(Boolean);
}

function commandLine(pid) {
    if (isWindows) {
        return run('powershell', ['-NoProfile', '-Command', `(Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}').CommandLine`]);
    }
    return run('ps', ['-o', 'command=', '-p', pid]);
}

for (const pid of listeners()) {
    const cmd = commandLine(pid).trim();
    const normalised = cmd.replaceAll('\\', '/').toLowerCase();
    const ours = normalised.includes(repo.replaceAll('\\', '/')) && normalised.includes('/next/dist/server/');
    if (!ours) {
        console.error(`Port ${port} is held by another program (PID ${pid}): ${cmd || 'unknown'}. Stop it, then retry.`);
        process.exit(1);
    }
    if (isWindows) run('taskkill', ['/PID', pid, '/T', '/F']);
    else process.kill(Number(pid), 'SIGTERM');
    console.log(`Stopped a leftover dev server on port ${port} (PID ${pid}).`);
}
