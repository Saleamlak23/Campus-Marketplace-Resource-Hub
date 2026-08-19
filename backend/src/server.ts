import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log('Server running on http://localhost:' + config.port);
  console.log('Environment: ' + config.nodeEnv);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});