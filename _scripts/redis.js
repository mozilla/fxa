const RedisServer = require('redis-server');
const server = new RedisServer(process.env.port);
server.open().then(() => {});
