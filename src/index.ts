import { runInit } from './cli/init.js';
import { startServer } from './server.js';

const command = process.argv[2];

if (command === 'init') {
  console.log('Initializing DevLens...');
  console.log('');
  runInit().catch((err: unknown) => {
    console.error('Init failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
} else {
  startServer().catch((err: unknown) => {
    console.error('[devlens] fatal:', err);
    process.exit(1);
  });
}
