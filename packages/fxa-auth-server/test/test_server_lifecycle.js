const TestServer = require('./test_server');
const config = require('../config').default.getProperties();

let serverInstance;

exports.mochaGlobalSetup = async function () {
  serverInstance = await TestServer.start(config);
  console.log(`✅ Test server started on port ${serverInstance.port}`);
};

exports.mochaGlobalTeardown = async function () {
  if (serverInstance) {
    await TestServer.stop(serverInstance);
    console.log('🛑 Test server stopped');
  }
};
