/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const url = require('url');
const tracing = require('fxa-shared/tracing/node-tracing');

module.exports = function (
  log,
  serverPublicKeys,
  signer,
  db,
  mailer,
  Password,
  config,
  customs,
  zendeskClient,
  statsd,
  profile,
  stripeHelper,
  redis,
  glean,
  push,
  pushbox
) {
  // Various extra helpers.
  const devicesImpl = require('../devices')(log, db, push, pushbox);
  const cadReminders = require('../cad-reminders')(config, log);
  const signinUtils = require('./utils/signin')(
    log,
    config,
    customs,
    db,
    mailer,
    cadReminders,
    glean
  );
  const clientUtils = require('./utils/clients')(log, config);
  const verificationReminders = require('../verification-reminders')(
    log,
    config
  );
  const subscriptionAccountReminders =
    require('../subscription-account-reminders')(log, config);
  const signupUtils = require('./utils/signup')(
    log,
    db,
    mailer,
    push,
    verificationReminders,
    glean
  );
  // The routing modules themselves.
  const defaults = require('./defaults')(log, config, db);
  const idp = require('./idp')(log, serverPublicKeys);
  const grant = require('../oauth/grant');
  const oauthRawDB = require('../oauth/db');
  grant.setStripeHelper(stripeHelper);
  const { accountRoutes } = require('./account');
  const account = accountRoutes(
    log,
    db,
    mailer,
    Password,
    config,
    customs,
    signinUtils,
    signupUtils,
    push,
    verificationReminders,
    subscriptionAccountReminders,
    oauthRawDB,
    stripeHelper,
    pushbox,
    glean
  );
  const oauth = require('./oauth')(
    log,
    config,
    db,
    mailer,
    devicesImpl,
    statsd,
    glean
  );
  const devicesSessions = require('./devices-and-sessions')(
    log,
    db,
    oauthRawDB,
    config,
    customs,
    push,
    pushbox,
    devicesImpl,
    clientUtils,
    redis
  );
  const attachedClients = require('./attached-clients')(
    log,
    db,
    devicesImpl,
    clientUtils
  );
  const emails = require('./emails')(
    log,
    db,
    mailer,
    config,
    customs,
    push,
    verificationReminders,
    cadReminders,
    signupUtils,
    zendeskClient,
    stripeHelper
  );
  const password = require('./password')(
    log,
    db,
    Password,
    config.smtp.redirectDomain,
    mailer,
    config.verifierVersion,
    customs,
    signinUtils,
    push,
    config,
    oauthRawDB,
    glean
  );
  const securityEvents = require('./security-events')(log, db, config);
  const session = require('./session')(
    log,
    db,
    Password,
    config,
    signinUtils,
    signupUtils,
    mailer,
    push,
    customs,
    glean
  );
  const sign = require('./sign')(
    log,
    signer,
    db,
    config.domain,
    devicesImpl,
    config
  );
  const unblockCodes = require('./unblock-codes')(
    log,
    db,
    mailer,
    config.signinUnblock,
    customs
  );
  const totp = require('./totp')(log, db, mailer, customs, config.totp, glean);
  const recoveryCodes = require('./recovery-codes')(
    log,
    db,
    config.totp,
    customs,
    mailer,
    glean
  );
  const recoveryKey = require('./recovery-key')(
    log,
    db,
    Password,
    config.verifierVersion,
    customs,
    mailer,
    glean
  );
  const subscriptions = require('./subscriptions').default(
    log,
    db,
    config,
    customs,
    push,
    mailer,
    profile,
    stripeHelper,
    zendeskClient
  );
  const newsletters = require('./newsletters')(log, db);
  const util = require('./util')(log, config, config.smtp.redirectDomain);

  const { linkedAccountRoutes } = require('./linked-accounts');
  const linkedAccounts = linkedAccountRoutes(
    log,
    db,
    config,
    mailer,
    profile,
    statsd
  );

  const { cloudTaskRoutes } = require('./cloud-tasks');
  const cloudTasks = cloudTaskRoutes(log, config);

  let basePath = url.parse(config.publicUrl).path;
  if (basePath === '/') {
    basePath = '';
  }

  const v1Routes = [].concat(
    account,
    oauth,
    devicesSessions,
    attachedClients,
    emails,
    password,
    recoveryCodes,
    securityEvents,
    session,
    sign,
    totp,
    unblockCodes,
    util,
    recoveryKey,
    subscriptions,
    newsletters,
    linkedAccounts,
    cloudTasks
  );

  function optionallyIgnoreTrace(fn) {
    return async function (request, ...args) {
      // Only authenticated routes or routes that specify an uid/email
      // can be traced because those routes can look a user up
      const canOptOut =
        request.auth ||
        (request.payload && request.payload.uid) ||
        (request.payload && request.payload.email);

      if (canOptOut) {
        const isMetricsEnabled = await request.app.isMetricsEnabled;
        if (!isMetricsEnabled) {
          // We need to create a parent context that suppresses traces.
          // Hapi's auto instrumentation inherits from the parent context and therefore
          // will get this.

          return tracing.suppressTrace(() => {
            return fn(request, ...args);
          });
        }
      }
      return fn(request, ...args);
    };
  }

  v1Routes.forEach((r) => {
    r.path = `${basePath}/v${config.apiVersion}${r.path}`;

    if (tracing.isInitialized()) {
      if (r.handler) {
        r.handler = optionallyIgnoreTrace(r.handler);
      }
    }
  });
  defaults.forEach((r) => {
    r.path = basePath + r.path;
  });
  const allRoutes = defaults.concat(idp, v1Routes);

  allRoutes.forEach((r) => {
    // Default auth.payload to 'optional' for all authenticated routes.
    // We'll validate the payload hash if the client provides it,
    // but allow them to skip it if they can't or don't want to.
    const auth = r.options && r.options.auth;
    // eslint-disable-next-line no-prototype-builtins
    if (auth && !auth.hasOwnProperty('payload')) {
      auth.payload = 'optional';
    }

    // Remove custom `apidoc` key which we use for generating docs,
    // but which Hapi doesn't like if it's there at runtime.
    delete r.apidoc;
  });

  return allRoutes;
};
