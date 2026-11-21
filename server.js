const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

const dir = path.resolve(__dirname);
const app = next({ dev: false, dir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  });

  server.listen(3001, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log('> Next.js server listo en http://localhost:3001');
  });
}).catch((err) => {
  console.error('Error al iniciar Next.js server:', err);
  process.exit(1);
});
