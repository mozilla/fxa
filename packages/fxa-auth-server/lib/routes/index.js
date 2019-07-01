/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const url = require('url');

module.exports = function(
  log,
  serverPublicKeys,
  signer,
  db,
  oauthdb,
  mailer,
  smsImpl,
  Password,
  config,
  customs
) {
  // Various extra helpers.
  const push = require('../push')(log, db, config);
  const pushbox = require('../pushbox')(log, config);
  const subhub = require('../subhub/client')(log, config);
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
  // The routing modules themselves.
  const defaults = require('./defaults')(log, db);
  const idp = require('./idp')(log, serverPublicKeys);
  const account = require('./account')(
    log,
    db,
    mailer,
    Password,
    config,
    customs,
    subhub,
    signinUtils,
    push,
    verificationReminders
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
    clientUtils
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
    verificationReminders
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
    config
  );
  const tokenCodes = require('./token-codes')(log, db, config, customs);
  const session = require('./session')(log, db, Password, config, signinUtils);
  const sign = require('./sign')(log, signer, db, config.domain, devicesImpl);
  const signinCodes = require('./signin-codes')(log, db, customs);
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
    oauthdb,
    subhub
  );
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
    session,
    signinCodes,
    sign,
    smsRoute,
    tokenCodes,
    totp,
    unblockCodes,
    util,
    recoveryKey,
    subscriptions
  );
  v1Routes.forEach(r => {
    r.path = `${basePath}/v1${r.path}`;
  });
  defaults.forEach(r => {
    r.path = basePath + r.path;
  });
  const allRoutes = defaults.concat(idp, v1Routes);

  allRoutes.forEach(r => {
    // Default auth.payload to 'optional' for all authenticated routes.
    // We'll validate the payload hash if the client provides it,
    // but allow them to skip it if they can't or don't want to.
    const auth = r.options && r.options.auth;
    if (auth && !auth.hasOwnProperty('payload')) {
      auth.payload = 'optional';
    }

    // Remove custom `apidoc` key which we use for generating docs,
    // but which Hapi doesn't like if it's there at runtime.
    delete r.apidoc;
  });

  return allRoutes;
};
