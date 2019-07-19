/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = config => {
  const otplib = require('otplib');
  const crypto = require('crypto');
  const P = require('../../lib/promise');
  const ClientApi = require('./api')(config);
  const butil = require('../../lib/crypto/butil');
  const pbkdf2 = require('../../lib/crypto/pbkdf2');
  const hkdf = require('../../lib/crypto/hkdf');
  const tokens = require('../../lib/tokens')({ trace: function() {} }, config);

  function Client(origin) {
    this.uid = null;
    this.authAt = 0;
    this.api = new ClientApi(origin);
    this.email = null;
    this.emailVerified = false;
    this.authToken = null;
    this.sessionToken = null;
    this.accountResetToken = null;
    this.keyFetchToken = null;
    this.passwordForgotToken = null;
    this.kA = null;
    this.wrapKb = null;
    this.totpAuthenticator = null;
    this.options = {};
  }

  Client.Api = ClientApi;

  Client.prototype.setupCredentials = function(email, password) {
    return P.resolve().then(() => {
      this.email = email;
      return pbkdf2
        .derive(
          Buffer.from(password),
          hkdf.KWE('quickStretch', email),
          1000,
          32
        )
        .then(stretch => {
          return hkdf(stretch, 'authPW', null, 32).then(authPW => {
            this.authPW = authPW;
            return hkdf(stretch, 'unwrapBKey', null, 32);
          });
        })
        .then(unwrapBKey => {
          this.unwrapBKey = unwrapBKey;
          return this;
        });
    });
  };

  Client.create = function(origin, email, password, options = {}) {
    const c = new Client(origin);
    c.options = options;

    return c.setupCredentials(email, password).then(() => {
      return c.create(options);
    });
  };

  Client.login = function(origin, email, password, opts) {
    const c = new Client(origin);

    return c.setupCredentials(email, password).then(c => {
      return c.auth(opts);
    });
  };

  Client.changePassword = function(
    origin,
    email,
    oldPassword,
    newPassword,
    headers
  ) {
    const c = new Client(origin);

    return c.setupCredentials(email, oldPassword).then(() => {
      return c.changePassword(newPassword, headers).then(() => {
        return c;
      });
    });
  };

  Client.createAndVerify = function(origin, email, password, mailbox, options) {
    return Client.create(origin, email, password, options).then(client => {
      return mailbox
        .waitForCode(email)
        .then(code => {
          return client.verifyEmail(code, options);
        })
        .then(() => {
          // clear the post verified email, if one was sent
          if (options && options.service === 'sync') {
            return mailbox.waitForEmail(email);
          }
        })
        .then(() => {
          return client;
        });
    });
  };

  Client.createAndVerifyAndTOTP = function(
    origin,
    email,
    password,
    mailbox,
    options
  ) {
    return Client.createAndVerify(
      origin,
      email,
      password,
      mailbox,
      options
    ).then(client => {
      client.totpAuthenticator = new otplib.Authenticator();
      return client
        .createTotpToken()
        .then(result => {
          client.totpAuthenticator.options = {
            secret: result.secret,
            crypto: crypto,
          };
          return client.verifyTotpCode(client.totpAuthenticator.generate());
        })
        .then(() => {
          return client;
        });
    });
  };

  Client.loginAndVerify = function(origin, email, password, mailbox, options) {
    if (!options) {
      options = {};
    }

    options.keys = options.keys || true;

    return Client.login(origin, email, password, options).then(client => {
      return mailbox
        .waitForCode(email)
        .then(code => {
          return client.verifyEmail(code, options);
        })
        .then(() => {
          return client;
        });
    });
  };

  Client.prototype.create = function() {
    return this.api
      .accountCreate(this.email, this.authPW, this.options)
      .then(a => {
        this.uid = a.uid;
        this.authAt = a.authAt;
        this.sessionToken = a.sessionToken;
        this.keyFetchToken = a.keyFetchToken;
        this.device = a.device;
        return this;
      });
  };

  Client.prototype._clear = function() {
    this.authToken = null;
    this.sessionToken = null;
    this.srpSession = null;
    this.accountResetToken = null;
    this.keyFetchToken = null;
    this.passwordForgotToken = null;
    this.kA = null;
    this.wrapKb = null;
  };

  Client.prototype.stringify = function() {
    return JSON.stringify(this);
  };

  Client.prototype.auth = function(opts) {
    return this.api.accountLogin(this.email, this.authPW, opts).then(data => {
      this.uid = data.uid;
      this.sessionToken = data.sessionToken;
      this.keyFetchToken = data.keyFetchToken || null;
      this.emailVerified = data.verified;
      this.authAt = data.authAt;
      this.device = data.device;
      this.verificationReason = data.verificationReason;
      this.verificationMethod = data.verificationMethod;
      this.verified = data.verified;
      return this;
    });
  };

  Client.prototype.login = function(opts) {
    return this.auth(opts);
  };

  Client.prototype.destroySession = function() {
    let p = P.resolve(null);
    if (this.sessionToken) {
      p = this.api.sessionDestroy(this.sessionToken).then(() => {
        this.sessionToken = null;
        return {};
      });
    }
    return p;
  };

  Client.prototype.reauth = function(opts) {
    return this.api
      .sessionReauth(this.sessionToken, this.email, this.authPW, opts)
      .then(data => {
        this.uid = data.uid;
        this.keyFetchToken = data.keyFetchToken || null;
        this.emailVerified = data.verified;
        this.authAt = data.authAt;
        this.verificationReason = data.verificationReason;
        this.verificationMethod = data.verificationMethod;
        this.verified = data.verified;
        return this;
      });
  };

  Client.prototype.duplicate = function() {
    const c = new Client(this.api.origin);
    c.uid = this.uid;
    c.authAt = this.authAt;
    c.email = this.email;
    c.emailVerified = this.emailVerified;
    c.authToken = this.authToken;
    c.sessionToken = this.sessionToken;
    c.kA = this.kA;
    c.kB = this.kB;
    c.wrapKb = this.wrapKb;
    c.unwrapBKey = this.unwrapBKey;
    c.authPW = this.authPW;
    c.options = this.options;
    return P.resolve()
      .then(() => {
        if (this.sessionToken) {
          return this.api.sessionDuplicate(this.sessionToken).then(data => {
            c.uid = data.uid;
            c.sessionToken = data.sessionToken;
            c.authAt = data.authAt;
            c.verified = data.verified;
            c.verificationReason = data.verificationReason;
            c.verificationMetho = data.verificationMethod;
          });
        }
      })
      .then(() => {
        return c;
      });
  };

  Client.prototype.verifySecondaryEmail = function(code, secondaryEmail) {
    const options = {
      type: 'secondary',
      secondaryEmail: secondaryEmail,
    };
    return this.api.recoveryEmailVerifyCode(this.uid, code, options);
  };

  Client.prototype.verifyEmail = function(code, options) {
    return this.api.recoveryEmailVerifyCode(this.uid, code, options);
  };

  Client.prototype.verifyTokenCode = function(code, options) {
    return this.api.verifyTokenCode(this.sessionToken, code, options);
  };

  Client.prototype.emailStatus = function() {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o.then(() => {
      return this.api.recoveryEmailStatus(this.sessionToken);
    });
  };

  Client.prototype.requestVerifyEmail = function() {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o.then(() => {
      return this.api.recoveryEmailResendCode(this.sessionToken, this.options);
    });
  };

  Client.prototype.sign = function(publicKey, duration, locale, options) {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o
      .then(() => {
        return this.api.certificateSign(
          this.sessionToken,
          publicKey,
          duration,
          locale,
          options
        );
      })
      .then(x => {
        return x.cert;
      });
  };

  Client.prototype.changePassword = function(
    newPassword,
    headers,
    sessionToken
  ) {
    return this.api
      .passwordChangeStart(this.email, this.authPW, headers)
      .then(json => {
        this.keyFetchToken = json.keyFetchToken;
        this.passwordChangeToken = json.passwordChangeToken;
        return this.keys();
      })
      .then((/* keys */) => {
        return this.setupCredentials(this.email, newPassword);
      })
      .then(() => {
        this.wrapKb = butil
          .xorBuffers(this.kB, this.unwrapBKey)
          .toString('hex');
        return this.api.passwordChangeFinish(
          this.passwordChangeToken,
          this.authPW,
          this.wrapKb,
          headers,
          sessionToken
        );
      })
      .then(res => {
        this._clear();

        // Update to new tokens if needed
        this.sessionToken = res.sessionToken
          ? res.sessionToken
          : this.sessionToken;
        this.authAt = res.authAt ? res.authAt : this.authAt;
        this.keyFetchToken = res.keyFetchToken
          ? res.keyFetchToken
          : this.keyFetchToken;

        return res;
      });
  };

  Client.prototype.keys = function() {
    const o = this.keyFetchToken ? P.resolve(null) : this.login();
    return o
      .then(() => {
        return this.api.accountKeys(this.keyFetchToken);
      })
      .then(data => {
        return tokens.KeyFetchToken.fromHex(this.keyFetchToken).then(token => {
          return token.unbundleKeys(data.bundle);
        });
      })
      .then(
        keys => {
          this.keyFetchToken = null;
          this.kA = keys.kA;
          this.wrapKb = keys.wrapKb;
          this.kB = keys.kB = butil
            .xorBuffers(this.wrapKb, this.unwrapBKey)
            .toString('hex');
          return keys;
        },
        err => {
          if (err && err.errno !== 104) {
            this.keyFetchToken = null;
          }
          throw err;
        }
      );
  };

  Client.prototype.attachedClients = function() {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o.then(() => {
      return this.api.attachedClients(this.sessionToken);
    });
  };

  Client.prototype.destroyAttachedClient = function(clientData) {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o.then(() => {
      return this.api.attachedClientDestroy(this.sessionToken, clientData);
    });
  };

  Client.prototype.devices = function() {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o.then(() => {
      return this.api.accountDevices(this.sessionToken);
    });
  };

  Client.prototype.devicesWithRefreshToken = function(refreshToken) {
    return this.api.accountDevicesWithRefreshToken(refreshToken);
  };

  Client.prototype.devicesNotifyWithRefreshToken = function(
    refreshToken,
    notifyDeviceId
  ) {
    return this.api.accountDevicesNotifyWithRefreshToken(
      refreshToken,
      notifyDeviceId
    );
  };

  Client.prototype.updateDevice = function(info) {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o
      .then(() => {
        return this.api.accountDevice(this.sessionToken, info);
      })
      .then(device => {
        if (!this.device || this.device.id === device.id) {
          this.device = device;
        }
        return device;
      });
  };

  Client.prototype.updateDeviceWithRefreshToken = function(
    refreshTokenId,
    info
  ) {
    return this.api
      .accountDeviceWithRefreshToken(refreshTokenId, info)
      .then(device => {
        if (!this.device || this.device.id === device.id) {
          this.device = device;
        }
        return device;
      });
  };

  Client.prototype.destroyDevice = function(id) {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o
      .then(() => {
        return this.api.deviceDestroy(this.sessionToken, id);
      })
      .then(() => {
        delete this.sessionToken;
      });
  };

  Client.prototype.destroyDeviceWithRefreshToken = function(
    refreshTokenId,
    id
  ) {
    return this.api.deviceDestroyWithRefreshToken(refreshTokenId, id);
  };

  Client.prototype.deviceCommandsWithRefreshToken = function(
    refreshTokenId,
    index,
    limit
  ) {
    return this.api.deviceCommandsWithRefreshToken(
      refreshTokenId,
      index,
      limit
    );
  };

  Client.prototype.devicesInvokeCommandWithRefreshToken = function(
    refreshTokenId,
    target,
    command,
    payload,
    ttl
  ) {
    return this.api.devicesInvokeCommandWithRefreshToken(
      refreshTokenId,
      target,
      command,
      payload,
      ttl
    );
  };

  Client.prototype.sessionStatus = function() {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o.then(() => {
      return this.api.sessionStatus(this.sessionToken);
    });
  };

  Client.prototype.securityEvents = function() {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o.then(() => {
      return this.api.securityEvents(this.sessionToken);
    });
  };

  Client.prototype.deleteSecurityEvents = function() {
    const o = this.sessionToken ? P.resolve(null) : this.login();
    return o.then(() => {
      return this.api.deleteSecurityEvents(this.sessionToken);
    });
  };

  Client.prototype.accountProfile = function(oauthToken) {
    if (oauthToken) {
      return this.api.accountProfile(null, {
        Authorization: `Bearer ${oauthToken}`,
      });
    } else {
      const o = this.sessionToken ? P.resolve(null) : this.login();
      return o.then(() => {
        return this.api.accountProfile(this.sessionToken);
      });
    }
  };

  Client.prototype.account = async function() {
    if (!this.sessionToken) {
      await this.login();
    }
    return this.api.account(this.sessionToken);
  };

  Client.prototype.destroyAccount = function() {
    if (this.sessionToken) {
      return this.api
        .accountDestroyWithSessionToken(
          this.email,
          this.authPW,
          this.sessionToken
        )
        .then(this._clear.bind(this));
    }
    return this.api
      .accountDestroy(this.email, this.authPW)
      .then(this._clear.bind(this));
  };

  Client.prototype.forgotPassword = function(lang) {
    return this.api
      .passwordForgotSendCode(this.email, this.options, lang)
      .then(x => {
        this.passwordForgotToken = x.passwordForgotToken;
      });
  };

  Client.prototype.reforgotPassword = function() {
    return this.api.passwordForgotResendCode(
      this.passwordForgotToken,
      this.email
    );
  };

  Client.prototype.verifyPasswordResetCode = function(code, headers, options) {
    return this.api
      .passwordForgotVerifyCode(
        this.passwordForgotToken,
        code,
        headers,
        options
      )
      .then(result => {
        this.accountResetToken = result.accountResetToken;
      });
  };

  Client.prototype.lockAccount = function() {
    return this.api.accountLock(this.email, this.authPW);
  };

  Client.prototype.resendAccountUnlockCode = function(lang) {
    return this.api.accountUnlockResendCode(this.email, this.options, lang);
  };

  Client.prototype.verifyAccountUnlockCode = function(uid, code) {
    return this.api.accountUnlockVerifyCode(uid, code);
  };

  Client.prototype.accountEmails = function() {
    return this.api.accountEmails(this.sessionToken);
  };

  Client.prototype.createEmail = function(email) {
    return this.api.createEmail(this.sessionToken, email);
  };

  Client.prototype.deleteEmail = function(email) {
    return this.api.deleteEmail(this.sessionToken, email);
  };

  Client.prototype.setPrimaryEmail = function(email) {
    return this.api.setPrimaryEmail(this.sessionToken, email);
  };

  Client.prototype.sendUnblockCode = function(email) {
    return this.api.sendUnblockCode(email);
  };

  Client.prototype.createTotpToken = function(options = {}) {
    return this.api.createTotpToken(this.sessionToken, options);
  };

  Client.prototype.deleteTotpToken = function() {
    return this.api.deleteTotpToken(this.sessionToken);
  };

  Client.prototype.checkTotpTokenExists = function() {
    return this.api.checkTotpTokenExists(this.sessionToken);
  };

  Client.prototype.verifyTotpCode = function(code, options = {}) {
    return this.api.verifyTotpCode(this.sessionToken, code, options);
  };

  Client.prototype.replaceRecoveryCodes = function(options = {}) {
    return this.api.replaceRecoveryCodes(this.sessionToken, options);
  };

  Client.prototype.consumeRecoveryCode = function(code, options = {}) {
    return this.api.consumeRecoveryCode(this.sessionToken, code, options);
  };

  Client.prototype.createRecoveryKey = function(recoveryKeyId, recoveryData) {
    return this.api.createRecoveryKey(
      this.sessionToken,
      recoveryKeyId,
      recoveryData
    );
  };

  Client.prototype.getRecoveryKey = function(recoveryKeyId) {
    if (!this.accountResetToken) {
      throw new Error(
        'call verifyPasswordResetCode before calling getRecoveryKey'
      );
    }

    return this.api.getRecoveryKey(this.accountResetToken, recoveryKeyId);
  };

  Client.prototype.getRecoveryKeyExists = function(email) {
    if (!email) {
      return this.api.getRecoveryKeyExistsWithSession(this.sessionToken);
    } else {
      return this.api.getRecoveryKeyExistsWithEmail(email);
    }
  };

  Client.prototype.deleteRecoveryKey = function() {
    return this.api.deleteRecoveryKey(this.sessionToken);
  };

  Client.prototype.resetAccountWithRecoveryKey = function(
    newPassword,
    kB,
    recoveryKeyId,
    headers,
    options = {}
  ) {
    if (!this.accountResetToken) {
      throw new Error(
        'call verifyPasswordResetCode before calling resetAccountWithRecoveryKey'
      );
    }

    let email = this.email;
    if (options && options.emailToHashWith) {
      email = options.emailToHashWith;
    }

    return this.setupCredentials(email, newPassword).then((/* bundle */) => {
      const wrapKb = options.undefinedWrapKb
        ? undefined
        : butil.xorBuffers(kB, this.unwrapBKey).toString('hex');

      return this.api
        .accountResetWithRecoveryKey(
          this.accountResetToken,
          this.authPW,
          wrapKb,
          recoveryKeyId,
          headers,
          options
        )
        .then(response => {
          // Update to the new verified tokens
          this.sessionToken = response.sessionToken;

          if (options.keys) {
            this.keyFetchToken = response.keyFetchToken;
          }

          return response;
        });
    });
  };

  Client.prototype.resetPassword = function(newPassword, headers, options) {
    if (!this.accountResetToken) {
      throw new Error(
        'call verifyPasswordResetCode before calling resetPassword'
      );
    }

    // With introduction of change email, the client can choose what to hash the password with.
    // To keep consistency, we hash with the email used to originally create the account.
    // This will generate a new wrapKb on the server
    let email = this.email;

    if (options && options.emailToHashWith) {
      email = options.emailToHashWith;
    }

    return this.setupCredentials(email, newPassword).then((/* bundle */) => {
      return this.api
        .accountReset(this.accountResetToken, this.authPW, headers, options)
        .then(response => {
          // Update to the new verified tokens
          this.sessionToken = response.sessionToken;
          this.keyFetchToken = response.keyFetchToken;

          return response;
        });
    });
  };

  Client.prototype.smsSend = function(
    phoneNumber,
    messageId,
    features,
    mailbox
  ) {
    return this.api
      .smsSend(this.sessionToken, phoneNumber, messageId, features)
      .then(result => {
        if (mailbox) {
          return mailbox.waitForSms(phoneNumber);
        }

        return result;
      });
  };

  Client.prototype.smsStatus = function(country, clientIpAddress) {
    return this.api.smsStatus(this.sessionToken, country, clientIpAddress);
  };

  Client.prototype.consumeSigninCode = function(code, metricsContext) {
    return this.api.consumeSigninCode(code, metricsContext);
  };

  Client.prototype.createAuthorizationCode = function(oauthParams) {
    return this.api.createAuthorizationCode(this.sessionToken, oauthParams);
  };

  Client.prototype.grantOAuthTokensFromSessionToken = function(oauthParams) {
    return this.api.grantOAuthTokensFromSessionToken(
      this.sessionToken,
      oauthParams
    );
  };

  Client.prototype.grantOAuthTokens = function(oauthParams) {
    return this.api.grantOAuthTokens(oauthParams);
  };

  Client.prototype.getSubscriptionClients = function(secret) {
    return this.api.getSubscriptionClients(secret);
  };

  Client.prototype.getSubscriptionPlans = function(refreshToken) {
    return this.api.getSubscriptionPlans(refreshToken);
  };

  Client.prototype.getActiveSubscriptions = function(refreshToken) {
    return this.api.getActiveSubscriptions(refreshToken);
  };

  Client.prototype.createSubscription = function(
    refreshToken,
    planId,
    paymentToken,
    displayName
  ) {
    return this.api.createSubscription(
      refreshToken,
      planId,
      paymentToken,
      displayName
    );
  };

  Client.prototype.updatePayment = function(refreshToken, paymentToken) {
    return this.api.updatePayment(refreshToken, paymentToken);
  };

  Client.prototype.getCustomer = function(refreshToken) {
    return this.api.getCustomer(refreshToken);
  };

  Client.prototype.cancelSubscription = function(refreshToken, subscriptionId) {
    return this.api.cancelSubscription(refreshToken, subscriptionId);
  };

  Client.prototype.reactivateSubscription = function(
    refreshToken,
    subscriptionId
  ) {
    return this.api.reactivateSubscription(refreshToken, subscriptionId);
  };

  return Client;
};
