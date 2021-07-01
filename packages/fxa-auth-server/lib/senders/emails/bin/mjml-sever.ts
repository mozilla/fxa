import http from 'http';
import stream from 'stream';
import net from 'net';
import { render } from '../renderer';

const { PORT = 8192, HOST = '0.0.0.0' } = process.env;

const MJML_OPTIONS = {};

console.log(`Starting MJML API server at ${HOST}:${PORT}`);

const server = http.createServer(handleRequest);
server.on('clientError', handleError);
server.listen({ port: PORT, host: HOST });

async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  try {
    const body = await readStream(req);
    const data = JSON.parse(body.trim());
    const { template: templateName, ...variables } = data;

    console.log(`REQUEST ${templateName}`);

    const result = render(templateName, variables);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(result.trim());
  } catch (err) {
    console.log(`ERR ${err}`);
    res.writeHead(400, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`Request error: ${err}`);
  }
  res.end();
}

function handleError(err: any, socket: net.Socket) {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
}

function readStream(readable: stream): Promise<string> {
  return new Promise((resolve, reject) => {
    const parts: any[] = [];
    readable.on('data', (chunk) => parts.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(parts).toString('utf8')));
    readable.on('error', (err) => reject(err));
  });
}
