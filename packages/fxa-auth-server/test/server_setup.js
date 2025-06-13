const TestServer = require('./test_server');
const config = require('../config').default.getProperties();


let serverInstance = null;

exports.mochaGlobalSetup = async function (done) {

  console.debug('⚙️ Starting TestServer from server_setup...');
  serverInstance = await TestServer.start(config, false, {
    enableCustomsChecks: true,
    authServerMockDependencies: {
          '../lib/payments/stripe': {
            // StripeHelper: mockStripeHelper,
            // createStripeHelper: () => mockStripeHelper,
          },
        },
  });
  console.debug('✅ TestServer instance started.');
}

exports.mochaGlobalTeardown = async function (done) {
  if (!serverInstance) {
    console.warn('⚠️ No TestServer instance to stop, skipping teardown.');
    return;
  }
    await TestServer.stop(serverInstance);
    serverInstance = null;
}
