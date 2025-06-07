const TestServer = require('./test_server');
const config = require('../config').default.getProperties();


let serverInstance = null;

exports.mochaGlobalSetup = async function () {
  console.debug('⚙️ Starting TestServer instance...');

  // TBD if options are needed or can be set globally for
  // all tests.
  const mockStripeHelper = {};
  mockStripeHelper.hasActiveSubscription = async () =>
    Promise.resolve(false);
  mockStripeHelper.removeCustomer = async () => Promise.resolve();

  // update config values as needed
  config.signinConfirmation.skipForNewAccounts.enabled
  // for the account_login_tests.js
  config.securityHistory.ipProfiling.allowedRecency = 0;
  config.signinConfirmation.skipForNewAccounts.enabled = false;

  // this are the defaults value, but set them explicitly
  config.subscriptions.enabled = false;
  config.oauth.url = 'http://localhost:9000';



  config.securityHistory.ipProfiling.allowedRecency = 0;

  // account_signin_verification_tests.js
  config.redis.sessionTokens.enabled = false;

  // attached_clients_tests.js
  // The only difference between original test values and default in the config
  // is setting the sampleRate. Default is 0.3
  // config.lastAccessTimeUpdates = {
  //   enabled: true,
  //   sampleRate: 1,
  //   earliestSaneTimestamp: config.lastAccessTimeUpdates.earliestSaneTimestamp,
  // };
  config.lastAccessTimeUpdates.sampleRate = 1;


  serverInstance = await TestServer.start(config, true, {
    enableCustomsChecks: true,
    authServerMockDependencies: {
          '../lib/payments/stripe': {
            StripeHelper: mockStripeHelper,
            createStripeHelper: () => mockStripeHelper,
          },
        },
  });
  console.debug('✅ TestServer started');
}

exports.mochaGlobalTeardown = async function () {
  if (!serverInstance) {
    console.warn('⚠️ No TestServer instance to stop, skipping teardown.');
    return;
  }
    console.debug('🛑 Stopping TestServer instance...');
    await TestServer.stop(serverInstance);
    serverInstance = null;
    console.debug('✔️ TestServer stopped');
}

// // add utilities to global scope so they're available in all tests
// global.TestUtilities = require('./test_utilities');
