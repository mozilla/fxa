const TestServer = require('./test_server');
const config = require('../config').default.getProperties();


let serverInstance = null;

exports.mochaGlobalSetup = async function () {
  serverInstance = await TestServer.start(config, false, { });
  console.debug('✅ TestServer started.');
}

exports.mochaGlobalTeardown = async function () {
  if (!serverInstance) {
    console.warn('⚠️ No TestServer instance to stop, skipping teardown.');
    return;
  }
    await TestServer.stop(serverInstance);
    serverInstance = null;
}
