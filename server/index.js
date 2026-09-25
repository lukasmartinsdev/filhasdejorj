import { createServer } from 'node:http';
import { createApiHandler } from './app.js';

const port = Number(process.env.API_PORT || 3001);
createServer(createApiHandler()).listen(port, '127.0.0.1', () => {
  console.log(`API Filhas de Jó RJ: http://127.0.0.1:${port}/api/health`);
});
