const TestServer = require('./test_server');
const config = require('../config').default.getProperties();


let serverInstance = null;

exports.mochaGlobalSetup = async function () {
  // // TBD if options are needed or can be set globally for
  // // all tests.
  // const mockStripeHelper = {};
  // mockStripeHelper.hasActiveSubscription = async () =>
  //   Promise.resolve(false);
  // mockStripeHelper.removeCustomer = async () => Promise.resolve();

  // account_create_tests.js
    // config.securityHistory.ipProfiling = {};

  // update config values as needed
  // for the account_login_tests.js
  // config.securityHistory.ipProfiling.allowedRecency = 0;
  // config.signinConfirmation.skipForNewAccounts.enabled = false;
  // config.accountDestroy.requireVerifiedSession = false;

  // same as default
  // config.subscriptions.enabled = false;
  // same as default
  // config.oauth.url = 'http://localhost:9000';

  // recovery_code_tests.js
  // these will be moved to #series tests
      // config.totp.recoveryCodes.count = 9;
      // config.totp.recoveryCodes.notifyLowCount = 9 - 2;

  // config.securityHistory.ipProfiling.allowedRecency = 0;

  // config.securityHistory.ipProfiling = {}
  // // account_signin_verification_tests.js
  // config.redis.sessionTokens.enabled = false;

  // // attached_clients_tests.js
  // // The only difference between original test values and default in the config
  // // is setting the sampleRate. Default is 0.3
  // // config.lastAccessTimeUpdates = {
  // //   enabled: true,
  // //   sampleRate: 1,
  // //   earliestSaneTimestamp: config.lastAccessTimeUpdates.earliestSaneTimestamp,
  // // };
  // config.lastAccessTimeUpdates.sampleRate = 1;

  console.debug('⚙️ Starting TestServer instance...');
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

exports.mochaGlobalTeardown = async function () {
  if (!serverInstance) {
    console.warn('⚠️ No TestServer instance to stop, skipping teardown.');
    return;
  }
    await TestServer.stop(serverInstance);
    serverInstance = null;
}
