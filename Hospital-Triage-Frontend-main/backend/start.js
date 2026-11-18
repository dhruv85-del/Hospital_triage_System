import 'dotenv/config';
import { execFileSync, spawn } from 'node:child_process';

const wslKeeper = spawn(
  'wsl.exe',
  ['-d', 'Ubuntu', '-u', 'root', '--', 'sleep', 'infinity'],
  { stdio: 'ignore', windowsHide: true },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    wslKeeper.kill();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  });
}
process.once('exit', () => wslKeeper.kill());

function runWsl(args) {
  return execFileSync('wsl.exe', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  }).trim();
}

function ensurePostgresRunning() {
  const clusters = runWsl(['-d', 'Ubuntu', '-u', 'root', '--', 'pg_lsclusters']);
  const mainCluster = clusters
    .split(/\r?\n/)
    .find((line) => /^\s*18\s+main\s+/.test(line));
  if (!mainCluster) {
    throw new Error('PostgreSQL 18 is not installed in the Ubuntu WSL distribution.');
  }
  if (!/\bonline\b/.test(mainCluster)) {
    runWsl(['-d', 'Ubuntu', '-u', 'root', '--', 'pg_ctlcluster', '18', 'main', 'start']);
  }

  const address = runWsl(['-d', 'Ubuntu', '--', 'hostname', '-I'])
    .split(/\s+/)
    .find((value) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value));
  const route = runWsl(['-d', 'Ubuntu', '--', 'bash', '-lc', 'ip route show default']);
  const gateway = route.match(/\bvia\s+(\d{1,3}(?:\.\d{1,3}){3})\b/)?.[1];
  if (!address || !gateway || !process.env.DATABASE_URL) {
    throw new Error('Could not resolve WSL PostgreSQL networking or DATABASE_URL.');
  }

  const rule = `host hospital_queue hospital_app ${gateway}/32 scram-sha-256`;
  const configCommand =
    `grep -qxF '${rule}' /etc/postgresql/18/main/pg_hba.conf || ` +
    `printf '%s\\n' '${rule}' >> /etc/postgresql/18/main/pg_hba.conf`;
  runWsl(['-d', 'Ubuntu', '-u', 'root', '--', 'bash', '-lc', configCommand]);
  runWsl(['-d', 'Ubuntu', '-u', 'root', '--', 'pg_ctlcluster', '18', 'main', 'reload']);

  const databaseUrl = new URL(process.env.DATABASE_URL);
  databaseUrl.hostname = address;
  process.env.DATABASE_URL = databaseUrl.toString();
}

try {
  await new Promise((resolve, reject) => {
    wslKeeper.once('spawn', resolve);
    wslKeeper.once('error', reject);
  });
  ensurePostgresRunning();
  const { startServer } = await import('./server.js');
  await startServer();
} catch (error) {
  wslKeeper.kill();
  console.error('Could not prepare the local PostgreSQL connection:', error.message);
  process.exitCode = 1;
}
