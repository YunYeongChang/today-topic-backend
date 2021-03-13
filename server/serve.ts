import http from 'http';
import { app } from './app';

const port = process.env.PORT || '5000';

app.set('port', port);
const server = http.createServer(app);
const onError = (error: { syscall: string; code: any }) => {
  if (error.syscall !== 'listen') throw error;

  switch (error.code) {
    case 'EACCES':
      throw new Error(`${port} requires elevated privileges`);
    case 'EADDRINUSE':
      throw new Error(`${port} is already in use`);
    default:
      throw error;
  }
};

const onListening = () => {
  console.log(`\n\nSecured API Server is Running on ${port}`);
};

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
