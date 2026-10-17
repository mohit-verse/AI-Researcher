import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('====================================================');
console.log('   Starting Scout AI Research Agent (Dev Mode)     ');
console.log('====================================================');

// Start Express Backend
const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true,
});

server.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[Backend]\x1b[0m ${data}`);
});

server.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// Start Vite Client
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  shell: true,
});

client.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[Frontend]\x1b[0m ${data}`);
});

client.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Frontend Error]\x1b[0m ${data}`);
});

function shutdown() {
  console.log('\nGracefully terminating Scout AI services...');
  server.kill();
  client.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
