/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const url = require('url');

module.exports = function (
  log,
  serverPublicKeys,
  signer,
  db,
  oauthdb,
  mailer,
  smsImpl,
  Password,
  config,
  customs,
  zendeskClient,
  statsd,
  profile,
  stripeHelper,
  redis
) {
  // Various extra helpers.
  const push = require('../push')(log, db, config);
  const pushbox = require('../pushbox')(log, config, statsd);
  const devicesImpl = require('../devices')(log, db, oauthdb, push);
  const signinUtils = require('./utils/signin')(
    log,
    config,
    customs,
    db,
    mailer
  );
  const clientUtils = require('./utils/clients')(log, config);
  const verificationReminders = require('../verification-reminders')(
    log,
    config
  );
  const signupUtils = require('./utils/signup')(
    log,
    db,
    mailer,
    push,
    verificationReminders
  );
  // The routing modules themselves.
  const defaults = require('./defaults')(log, db);
  const idp = require('./idp')(log, serverPublicKeys);
  const oauthServer = require('../oauth/routes');
  const grant = require('../oauth/grant');
  grant.setStripeHelper(stripeHelper);
  const account = require('./account')(
    log,
    db,
    mailer,
    Password,
    config,
    customs,
    signinUtils,
    push,
    verificationReminders,
    require('../oauth/db'),
    stripeHelper
  );
  const oauth = require('./oauth')(
    log,
    config,
    oauthdb,
    db,
    mailer,
    devicesImpl
  );
  const devicesSessions = require('./devices-and-sessions')(
    log,
    db,
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
    oauthdb,
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
    require('../oauth/db')
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
    push
  );
  const sign = require('./sign')(log, signer, db, config.domain, devicesImpl);
  const signinCodes = require('./signin-codes')(log, db, customs, config);
  const smsRoute = require('./sms')(log, db, config, customs, smsImpl);
  const unblockCodes = require('./unblock-codes')(
    log,
    db,
    mailer,
    config.signinUnblock,
    customs
  );
  const totp = require('./totp')(log, db, mailer, customs, config.totp);
  const recoveryCodes = require('./recovery-codes')(
    log,
    db,
    config.totp,
    customs,
    mailer
  );
  const recoveryKey = require('./recovery-key')(
    log,
    db,
    Password,
    config.verifierVersion,
    customs,
    mailer
  );
  const subscriptions = require('./subscriptions')(
    log,
    db,
    config,
    customs,
    push,
    mailer,
    profile,
    stripeHelper
  );
  const support = require('./support')(log, db, config, customs, zendeskClient);
  const newsletters = require('./newsletters')(log, db);
  const util = require('./util')(log, config, config.smtp.redirectDomain);

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
    signinCodes,
    sign,
    smsRoute,
    totp,
    unblockCodes,
    util,
    recoveryKey,
    subscriptions,
    support,
    newsletters
  );
  v1Routes.forEach((r) => {
    r.path = `${basePath}/v1${r.path}`;
  });
  defaults.forEach((r) => {
    r.path = basePath + r.path;
  });
  oauthServer.routes.forEach((r) => {
    r.path = basePath + r.path;
  });
  const allRoutes = defaults.concat(idp, v1Routes, oauthServer.routes);

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
