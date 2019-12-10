/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = config => {
  const EventEmitter = require('events').EventEmitter;
  const util = require('util');

  const hawk = require('hawk');
  const P = require('../../lib/promise');
  const request = require('request');

  const tokens = require('../../lib/tokens')({ trace: function() {} }, config);

  util.inherits(ClientApi, EventEmitter);
  function ClientApi(origin) {
    EventEmitter.call(this);
    this.origin = origin;
    this.baseURL = `${origin}/v1`;
    this.timeOffset = 0;
  }

  ClientApi.prototype.Token = tokens;

  function hawkHeader(token, method, url, payload, offset) {
    const verify = {
      credentials: token,
    };
    if (payload) {
      verify.contentType = 'application/json';
      verify.payload = JSON.stringify(payload);
    }
    if (offset) {
      verify.localtimeOffsetMsec = offset;
    }
    return hawk.client.header(url, method, verify).header;
  }

  ClientApi.prototype.doRequest = function(
    method,
    url,
    token,
    payload,
    headers
  ) {
    const d = P.defer();
    if (typeof headers === 'undefined') {
      headers = {};
    }
    // We do a shallow clone to avoid tainting the caller's copy of `headers`.
    headers = Object.assign({}, headers);
    if (token && !headers.Authorization) {
      headers.Authorization = hawkHeader(
        token,
        method,
        url,
        payload,
        this.timeOffset
      );
    }
    const options = {
      url: url,
      method: method,
      headers: headers,
      json: payload || true,
    };
    if (headers['accept-language'] === undefined) {
      delete headers['accept-language'];
    }
    this.emit('startRequest', options);
    request(options, (err, res, body) => {
      if (res && res.headers.timestamp) {
        // Record time skew
        this.timeOffset =
          Date.now() - parseInt(res.headers.timestamp, 10) * 1000;
      }

      this.emit('endRequest', options, err, res);
      if (err || body.error || res.statusCode !== 200) {
        return d.reject(err || body);
      }

      const allowedOrigin = res.headers['access-control-allow-origin'];
      if (allowedOrigin) {
        // Requiring config outside this condition causes the local tests to fail
        // because tokenLifetimes.passwordChangeToken is -1
        const config = require('../../config');
        if (config.get('corsOrigin').indexOf(allowedOrigin) < 0) {
          return d.reject(
            new Error(`Unexpected allowed origin: ${allowedOrigin}`)
          );
        }
      }

      d.resolve(body);
    });
    return d.promise;
  };

  ClientApi.prototype.doRequestWithBearerToken = function(
    method,
    url,
    token,
    payload,
    headers
  ) {
    return this.doRequest(method, url, null, payload, {
      ...headers,
      Authorization: `Bearer ${token}`,
    });
  };

  ClientApi.prototype.doRequestWithSecret = function(
    method,
    url,
    secret,
    payload,
    headers = {}
  ) {
    return this.doRequest(method, url, null, payload, {
      ...headers,
      Authorization: secret,
    });
  };

  /*
   *  Creates a user account.
   *
   *  ___Parameters___
   *
   *  * email - the primary email for this account
   *  * verifier - the derived SRP verifier
   *  * salt - SPR salt
   *  * params
   *      * srp
   *          * alg - hash function for SRP (sha256)
   *          * N_bits - SPR group bits (2048)
   *      * stretch
   *          * rounds - number of rounds of password stretching
   *
   *   ___Response___
   *   {}
   *
   */
  ClientApi.prototype.accountCreate = function(email, authPW, options = {}) {
    const url = `${this.baseURL}/account/create${getQueryString(options)}`;
    return this.doRequest(
      'POST',
      url,
      null,
      {
        email: email,
        authPW: authPW.toString('hex'),
        preVerified: options.preVerified || undefined,
        service: options.service || undefined,
        redirectTo: options.redirectTo || undefined,
        resume: options.resume || undefined,
        device: options.device || undefined,
        metricsContext: options.metricsContext || undefined,
        style: options.style || undefined,
        verificationMethod: options.verificationMethod || undefined,
      },
      {
        'accept-language': options.lang,
      }
    );
  };

  ClientApi.prototype.accountLogin = function(email, authPW, options) {
    if (!options) {
      options = { keys: true };
    }

    return this.doRequest(
      'POST',
      `${this.baseURL}/account/login${getQueryString(options)}`,
      null,
      {
        email: email,
        authPW: authPW.toString('hex'),
        service: options.service || undefined,
        resume: options.resume || undefined,
        reason: options.reason || undefined,
        device: options.device || undefined,
        metricsContext: options.metricsContext || undefined,
        originalLoginEmail: options.originalLoginEmail || undefined,
        verificationMethod: options.verificationMethod || undefined,
      },
      {
        'accept-language': options.lang,
      }
    );
  };

  ClientApi.prototype.accountKeys = function(keyFetchTokenHex) {
    return tokens.KeyFetchToken.fromHex(keyFetchTokenHex).then(token => {
      return this.doRequest('GET', `${this.baseURL}/account/keys`, token);
    });
  };

  ClientApi.prototype.accountDevices = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('GET', `${this.baseURL}/account/devices`, token);
    });
  };

  ClientApi.prototype.accountDevicesWithRefreshToken = function(
    refreshTokenHex
  ) {
    return this.doRequestWithBearerToken(
      'GET',
      `${this.baseURL}/account/devices`,
      refreshTokenHex
    );
  };

  ClientApi.prototype.accountDevice = function(sessionTokenHex, info) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/account/device`,
        token,
        info
      );
    });
  };

  ClientApi.prototype.accountDeviceWithRefreshToken = function(
    refreshTokenHex,
    info
  ) {
    return this.doRequestWithBearerToken(
      'POST',
      `${this.baseURL}/account/device`,
      refreshTokenHex,
      info
    );
  };

  ClientApi.prototype.deviceDestroy = function(sessionTokenHex, id) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/account/device/destroy`,
        token,
        {
          id: id,
        }
      );
    });
  };

  ClientApi.prototype.deviceDestroyWithRefreshToken = function(
    refreshTokenHex,
    id
  ) {
    return this.doRequestWithBearerToken(
      'POST',
      `${this.baseURL}/account/device/destroy`,
      refreshTokenHex,
      {
        id: id,
      }
    );
  };

  ClientApi.prototype.deviceCommandsWithRefreshToken = function(
    refreshTokenHex,
    index,
    limit
  ) {
    // eslint-disable-next-line no-undef
    const queryParams = new URLSearchParams({
      index,
      limit,
    });
    const url = `${
      this.baseURL
    }/account/device/commands?${queryParams.toString()}`;

    return this.doRequestWithBearerToken('GET', url, refreshTokenHex);
  };

  ClientApi.prototype.devicesInvokeCommandWithRefreshToken = function(
    refreshTokenHex,
    target,
    command,
    payload,
    ttl
  ) {
    return this.doRequestWithBearerToken(
      'POST',
      `${this.baseURL}/account/devices/invoke_command`,
      refreshTokenHex,
      {
        command,
        payload,
        target,
        ttl,
      }
    );
  };

  ClientApi.prototype.accountDevicesNotifyWithRefreshToken = function(
    refreshTokenHex,
    notifyDeviceId
  ) {
    return this.doRequestWithBearerToken(
      'POST',
      `${this.baseURL}/account/devices/notify`,
      refreshTokenHex,
      {
        to: notifyDeviceId,
      }
    );
  };

  ClientApi.prototype.accountStatusByEmail = function(email) {
    if (email) {
      return this.doRequest('POST', `${this.baseURL}/account/status`, null, {
        email: email,
      });
    } else {
      return this.doRequest('POST', `${this.baseURL}/account/status`);
    }
  };

  ClientApi.prototype.accountStatus = function(uid, sessionTokenHex) {
    if (sessionTokenHex) {
      return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
        return this.doRequest('GET', `${this.baseURL}/account/status`, token);
      });
    } else if (uid) {
      return this.doRequest('GET', `${this.baseURL}/account/status?uid=${uid}`);
    } else {
      // for testing the error response only
      return this.doRequest('GET', `${this.baseURL}/account/status`);
    }
  };

  ClientApi.prototype.accountReset = function(
    accountResetTokenHex,
    authPW,
    headers,
    options = {}
  ) {
    const qs = getQueryString(options);

    // Default behavior is to request sessionToken
    if (options.sessionToken === undefined) {
      options.sessionToken = true;
    }

    return tokens.AccountResetToken.fromHex(accountResetTokenHex).then(
      token => {
        return this.doRequest(
          'POST',
          `${this.baseURL}/account/reset${qs}`,
          token,
          {
            authPW: authPW.toString('hex'),
            sessionToken: options.sessionToken,
          },
          headers
        );
      }
    );
  };

  ClientApi.prototype.accountResetWithRecoveryKey = function(
    accountResetTokenHex,
    authPW,
    wrapKb,
    recoveryKeyId,
    headers,
    options = {}
  ) {
    const qs = getQueryString(options);

    return tokens.AccountResetToken.fromHex(accountResetTokenHex).then(
      token => {
        return this.doRequest(
          'POST',
          `${this.baseURL}/account/reset${qs}`,
          token,
          {
            authPW: authPW.toString('hex'),
            wrapKb,
            sessionToken: true,
            recoveryKeyId,
          },
          headers
        );
      }
    );
  };

  ClientApi.prototype.accountDestroy = function(email, authPW) {
    return this.doRequest('POST', `${this.baseURL}/account/destroy`, null, {
      email: email,
      authPW: authPW.toString('hex'),
    });
  };

  ClientApi.prototype.accountDestroyWithSessionToken = function(
    email,
    authPW,
    sessionTokenHex
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('POST', `${this.baseURL}/account/destroy`, token, {
        email,
        authPW: authPW.toString('hex'),
      });
    });
  };

  ClientApi.prototype.recoveryEmailStatus = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'GET',
        `${this.baseURL}/recovery_email/status`,
        token
      );
    });
  };

  ClientApi.prototype.recoveryEmailResendCode = function(
    sessionTokenHex,
    options = {}
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/recovery_email/resend_code`,
        token,
        {
          service: options.service || undefined,
          redirectTo: options.redirectTo || undefined,
          resume: options.resume || undefined,
          email: options.email || undefined,
          type: options.type || undefined,
        }
      );
    });
  };

  ClientApi.prototype.recoveryEmailVerifyCode = function(
    uid,
    code,
    options = {}
  ) {
    return this.doRequest(
      'POST',
      `${this.baseURL}/recovery_email/verify_code`,
      null,
      {
        uid: uid,
        code: code,
        service: options.service || undefined,
        type: options.type || undefined,
        verifiedEmail: options.verifiedEmail || undefined,
        style: options.style || undefined,
        newsletters: options.newsletters || undefined,
      },
      {
        'accept-language': options.lang,
      }
    );
  };

  ClientApi.prototype.recoveryEmailSecondaryVerifyCode = async function(
    sessionTokenHex,
    code,
    email
  ) {
    const token = await tokens.SessionToken.fromHex(sessionTokenHex);
    return this.doRequest(
      'POST',
      `${this.baseURL}/recovery_email/secondary/verify_code`,
      token,
      {
        code,
        email,
      },
      {}
    );
  };

  ClientApi.prototype.recoveryEmailSecondaryResendCode = async function(
    sessionTokenHex,
    email
  ) {
    const token = await tokens.SessionToken.fromHex(sessionTokenHex);
    return this.doRequest(
      'POST',
      `${this.baseURL}/recovery_email/secondary/resend_code`,
      token,
      {
        email,
      },
      {}
    );
  };

  ClientApi.prototype.accountCreateWithShortCode = async function(
    sessionTokenHex,
    code,
    options = {}
  ) {
    const token = await tokens.SessionToken.fromHex(sessionTokenHex);
    return this.doRequest(
      'POST',
      `${this.baseURL}/session/verify_code`,
      token,
      {
        code,
        service: options.service,
        newsletters: options.newsletters || undefined,
      }
    );
  };

  ClientApi.prototype.resendAccountCreateWithShortCode = async function(
    sessionTokenHex
  ) {
    const token = await tokens.SessionToken.fromHex(sessionTokenHex);
    return this.doRequest(
      'POST',
      `${this.baseURL}/session/resend_code`,
      token,
      {}
    );
  };

  ClientApi.prototype.certificateSign = function(
    sessionTokenHex,
    publicKey,
    duration,
    locale,
    options = {}
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      let url = `${this.baseURL}/certificate/sign`;
      if (options.service) {
        url += `?service=${options.service}`;
      }
      return this.doRequest(
        'POST',
        url,
        token,
        {
          publicKey: publicKey,
          duration: duration,
        },
        {
          'accept-language': locale,
        }
      );
    });
  };

  ClientApi.prototype.getRandomBytes = function() {
    return this.doRequest('POST', `${this.baseURL}/get_random_bytes`);
  };

  ClientApi.prototype.passwordChangeStart = function(
    email,
    oldAuthPW,
    headers
  ) {
    return this.doRequest(
      'POST',
      `${this.baseURL}/password/change/start`,
      null,
      {
        email: email,
        oldAuthPW: oldAuthPW.toString('hex'),
      },
      headers
    );
  };

  ClientApi.prototype.passwordChangeFinish = function(
    passwordChangeTokenHex,
    authPW,
    wrapKb,
    headers,
    sessionToken
  ) {
    const options = {};
    return tokens.PasswordChangeToken.fromHex(passwordChangeTokenHex).then(
      token => {
        const requestData = {
          authPW: authPW.toString('hex'),
          wrapKb: wrapKb.toString('hex'),
        };

        if (sessionToken) {
          // Support legacy clients and new clients
          requestData.sessionToken = sessionToken;
          options.keys = true;
        }

        return this.doRequest(
          'POST',
          `${this.baseURL}/password/change/finish${getQueryString(options)}`,
          token,
          requestData,
          headers
        );
      }
    );
  };

  ClientApi.prototype.passwordForgotSendCode = function(
    email,
    options = {},
    lang
  ) {
    let headers = {};
    if (lang) {
      headers = {
        'accept-language': lang,
      };
    }
    return this.doRequest(
      'POST',
      `${this.baseURL}/password/forgot/send_code${getQueryString(options)}`,
      null,
      {
        email: email,
        service: options.service || undefined,
        redirectTo: options.redirectTo || undefined,
        resume: options.resume || undefined,
        metricsContext: options.metricsContext || undefined,
      },
      headers
    );
  };

  ClientApi.prototype.passwordForgotResendCode = function(
    passwordForgotTokenHex,
    email,
    options = {}
  ) {
    return tokens.PasswordForgotToken.fromHex(passwordForgotTokenHex).then(
      token => {
        return this.doRequest(
          'POST',
          `${this.baseURL}/password/forgot/resend_code${getQueryString(
            options
          )}`,
          token,
          {
            email: email,
            service: options.service || undefined,
            redirectTo: options.redirectTo || undefined,
            resume: options.resume || undefined,
          }
        );
      }
    );
  };

  ClientApi.prototype.passwordForgotVerifyCode = function(
    passwordForgotTokenHex,
    code,
    headers,
    options
  ) {
    if (!options) {
      options = {};
    }

    return tokens.PasswordForgotToken.fromHex(passwordForgotTokenHex).then(
      token => {
        return this.doRequest(
          'POST',
          `${this.baseURL}/password/forgot/verify_code`,
          token,
          {
            code: code,
            accountResetWithRecoveryKey:
              options.accountResetWithRecoveryKey || undefined,
          },
          headers
        );
      }
    );
  };

  ClientApi.prototype.passwordForgotStatus = function(passwordForgotTokenHex) {
    return tokens.PasswordForgotToken.fromHex(passwordForgotTokenHex).then(
      token => {
        return this.doRequest(
          'GET',
          `${this.baseURL}/password/forgot/status`,
          token
        );
      }
    );
  };

  ClientApi.prototype.accountLock = function(email, authPW) {
    return this.doRequest('POST', `${this.baseURL}/account/lock`, null, {
      email: email,
      authPW: authPW.toString('hex'),
    });
  };

  ClientApi.prototype.accountUnlockResendCode = function(
    email,
    options = {},
    lang
  ) {
    let headers = {};
    if (lang) {
      headers = {
        'accept-language': lang,
      };
    }
    return this.doRequest(
      'POST',
      `${this.baseURL}/account/unlock/resend_code`,
      null,
      {
        email: email,
        service: options.service || undefined,
        redirectTo: options.redirectTo || undefined,
        resume: options.resume || undefined,
      },
      headers
    );
  };

  ClientApi.prototype.accountUnlockVerifyCode = function(uid, code) {
    return this.doRequest(
      'POST',
      `${this.baseURL}/account/unlock/verify_code`,
      null,
      {
        uid: uid,
        code: code,
      }
    );
  };

  ClientApi.prototype.attachedClientDestroy = function(
    sessionTokenHex,
    clientData
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/account/attached_client/destroy`,
        token,
        clientData
      );
    });
  };

  ClientApi.prototype.sessionDestroy = function(sessionTokenHex, options) {
    let data = null;

    if (options && options.customSessionToken) {
      data = {
        customSessionToken: options.customSessionToken,
      };
    }

    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/session/destroy`,
        token,
        data
      );
    });
  };

  ClientApi.prototype.sessionReauth = function(
    sessionTokenHex,
    email,
    authPW,
    options = {}
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/session/reauth${getQueryString(options)}`,
        token,
        {
          email: email,
          authPW: authPW.toString('hex'),
          service: options.service || undefined,
          resume: options.resume || undefined,
          reason: options.reason || undefined,
          metricsContext: options.metricsContext || undefined,
        }
      );
    });
  };

  ClientApi.prototype.sessionDuplicate = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/session/duplicate`,
        token,
        {}
      );
    });
  };

  ClientApi.prototype.sessions = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('GET', `${this.baseURL}/account/sessions`, token);
    });
  };

  ClientApi.prototype.attachedClients = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'GET',
        `${this.baseURL}/account/attached_clients`,
        token
      );
    });
  };

  ClientApi.prototype.sessionStatus = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('GET', `${this.baseURL}/session/status`, token);
    });
  };

  ClientApi.prototype.securityEvents = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('GET', `${this.baseURL}/securityEvents`, token);
    });
  };

  ClientApi.prototype.deleteSecurityEvents = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('DELETE', `${this.baseURL}/securityEvents`, token);
    });
  };

  ClientApi.prototype.accountProfile = function(sessionTokenHex, headers) {
    const o = sessionTokenHex
      ? tokens.SessionToken.fromHex(sessionTokenHex)
      : P.resolve(null);
    return o.then(token => {
      return this.doRequest(
        'GET',
        `${this.baseURL}/account/profile`,
        token,
        undefined,
        headers
      );
    });
  };

  ClientApi.prototype.account = async function(sessionTokenHex) {
    const token = await tokens.SessionToken.fromHex(sessionTokenHex);
    return this.doRequest('GET', `${this.baseURL}/account`, token);
  };

  ClientApi.prototype.smsSend = function(
    sessionTokenHex,
    phoneNumber,
    messageId,
    features
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token =>
      this.doRequest('POST', `${this.baseURL}/sms`, token, {
        phoneNumber,
        messageId,
        features,
      })
    );
  };

  ClientApi.prototype.smsStatus = function(
    sessionTokenHex,
    country,
    clientIpAddress
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token =>
      this.doRequest(
        'GET',
        `${this.baseURL}/sms/status${country ? `?country=${country}` : ''}`,
        token,
        null,
        { 'X-Forwarded-For': clientIpAddress || '8.8.8.8' }
      )
    );
  };

  ClientApi.prototype.accountEmails = function(sessionTokenHex) {
    const o = sessionTokenHex
      ? tokens.SessionToken.fromHex(sessionTokenHex)
      : P.resolve(null);
    return o.then(token => {
      return this.doRequest('GET', `${this.baseURL}/recovery_emails`, token);
    });
  };

  ClientApi.prototype.createEmail = function(
    sessionTokenHex,
    email,
    options = {}
  ) {
    const o = sessionTokenHex
      ? tokens.SessionToken.fromHex(sessionTokenHex)
      : P.resolve(null);
    return o.then(token => {
      return this.doRequest('POST', `${this.baseURL}/recovery_email`, token, {
        email: email,
        verificationMethod: options.verificationMethod,
      });
    });
  };

  ClientApi.prototype.deleteEmail = function(sessionTokenHex, email) {
    const o = sessionTokenHex
      ? tokens.SessionToken.fromHex(sessionTokenHex)
      : P.resolve(null);
    return o.then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/recovery_email/destroy`,
        token,
        {
          email: email,
        }
      );
    });
  };

  ClientApi.prototype.setPrimaryEmail = function(sessionTokenHex, email) {
    const o = sessionTokenHex
      ? tokens.SessionToken.fromHex(sessionTokenHex)
      : P.resolve(null);
    return o.then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/recovery_email/set_primary`,
        token,
        {
          email: email,
        }
      );
    });
  };

  ClientApi.prototype.sendUnblockCode = function(email) {
    return this.doRequest(
      'POST',
      `${this.baseURL}/account/login/send_unblock_code`,
      null,
      {
        email: email,
      }
    );
  };

  ClientApi.prototype.consumeSigninCode = function(code, metricsContext) {
    return this.doRequest('POST', `${this.baseURL}/signinCodes/consume`, null, {
      code,
      metricsContext,
    });
  };

  ClientApi.prototype.verifyTokenCode = function(
    sessionTokenHex,
    code,
    options = {}
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/session/verify/token`,
        token,
        {
          code: code,
          uid: options.uid || undefined,
          metricsContext: options.metricsContext,
        }
      );
    });
  };

  ClientApi.prototype.createTotpToken = function(
    sessionTokenHex,
    options = {}
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('POST', `${this.baseURL}/totp/create`, token, {
        metricsContext: options.metricsContext,
      });
    });
  };

  ClientApi.prototype.deleteTotpToken = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('POST', `${this.baseURL}/totp/destroy`, token, {});
    });
  };

  ClientApi.prototype.checkTotpTokenExists = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('GET', `${this.baseURL}/totp/exists`, token).bind(
        this
      );
    });
  };

  ClientApi.prototype.verifyTotpCode = function(
    sessionTokenHex,
    code,
    options = {}
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/session/verify/totp`,
        token,
        {
          code: code,
          service: options.service,
        }
      );
    });
  };

  ClientApi.prototype.replaceRecoveryCodes = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('GET', `${this.baseURL}/recoveryCodes`, token);
    });
  };

  ClientApi.prototype.consumeRecoveryCode = function(
    sessionTokenHex,
    code,
    options = {}
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/session/verify/recoveryCode`,
        token,
        {
          code: code,
        }
      );
    });
  };

  ClientApi.prototype.createRecoveryKey = function(
    sessionTokenHex,
    recoveryKeyId,
    recoveryData
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('POST', `${this.baseURL}/recoveryKey`, token, {
        recoveryKeyId,
        recoveryData,
      });
    });
  };

  ClientApi.prototype.getRecoveryKey = function(
    accountResetTokenHex,
    recoveryKeyId
  ) {
    return tokens.AccountResetToken.fromHex(accountResetTokenHex).then(
      token => {
        return this.doRequest(
          'GET',
          `${this.baseURL}/recoveryKey/${recoveryKeyId}`,
          token
        );
      }
    );
  };

  ClientApi.prototype.getRecoveryKeyExistsWithSession = function(
    sessionTokenHex
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/recoveryKey/exists`,
        token,
        {}
      );
    });
  };

  ClientApi.prototype.getRecoveryKeyExistsWithEmail = function(email) {
    return this.doRequest(
      'POST',
      `${this.baseURL}/recoveryKey/exists`,
      undefined,
      { email }
    );
  };

  ClientApi.prototype.deleteRecoveryKey = function(sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest('DELETE', `${this.baseURL}/recoveryKey`, token);
    });
  };

  ClientApi.prototype.createAuthorizationCode = function(
    sessionTokenHex,
    oauthParams
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/oauth/authorization`,
        token,
        oauthParams
      );
    });
  };

  ClientApi.prototype.grantOAuthTokensFromSessionToken = function(
    sessionTokenHex,
    oauthParams
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/oauth/token`,
        token,
        oauthParams
      );
    });
  };

  ClientApi.prototype.grantOAuthTokens = function(oauthParams) {
    return this.doRequest(
      'POST',
      `${this.baseURL}/oauth/token`,
      null,
      oauthParams
    );
  };

  ClientApi.prototype.revokeOAuthToken = function(oauthParams) {
    return this.doRequest(
      'POST',
      `${this.baseURL}/oauth/destroy`,
      null,
      oauthParams
    );
  };

  ClientApi.prototype.getScopedKeyData = function(
    sessionTokenHex,
    oauthParams
  ) {
    return tokens.SessionToken.fromHex(sessionTokenHex).then(token => {
      return this.doRequest(
        'POST',
        `${this.baseURL}/account/scoped-key-data`,
        token,
        oauthParams
      );
    });
  };

  ClientApi.prototype.getSubscriptionClients = function(secret) {
    return this.doRequestWithSecret(
      'GET',
      `${this.baseURL}/oauth/subscriptions/clients`,
      secret
    );
  };

  ClientApi.prototype.getSubscriptionPlans = function(refreshToken) {
    return this.doRequestWithBearerToken(
      'GET',
      `${this.baseURL}/oauth/subscriptions/plans`,
      refreshToken
    );
  };

  ClientApi.prototype.getActiveSubscriptions = function(refreshToken) {
    return this.doRequestWithBearerToken(
      'GET',
      `${this.baseURL}/oauth/subscriptions/active`,
      refreshToken
    );
  };

  ClientApi.prototype.createSubscription = function(
    refreshToken,
    planId,
    paymentToken,
    displayName
  ) {
    return this.doRequestWithBearerToken(
      'POST',
      `${this.baseURL}/oauth/subscriptions/active`,
      refreshToken,
      {
        planId,
        paymentToken,
        displayName,
      }
    );
  };

  ClientApi.prototype.updatePayment = function(refreshToken, paymentToken) {
    return this.doRequestWithBearerToken(
      'POST',
      `${this.baseURL}/oauth/subscriptions/updatePayment`,
      refreshToken,
      {
        paymentToken,
      }
    );
  };

  ClientApi.prototype.getCustomer = function(refreshToken) {
    return this.doRequestWithBearerToken(
      'GET',
      `${this.baseURL}/oauth/subscriptions/customer`,
      refreshToken
    );
  };

  ClientApi.prototype.cancelSubscription = function(
    refreshToken,
    subscriptionId
  ) {
    return this.doRequestWithBearerToken(
      'DELETE',
      `${this.baseURL}/oauth/subscriptions/active/${subscriptionId}`,
      refreshToken
    );
  };

  ClientApi.prototype.reactivateSubscription = function(
    refreshToken,
    subscriptionId
  ) {
    return this.doRequestWithBearerToken(
      'POST',
      `${this.baseURL}/oauth/subscriptions/reactivate`,
      refreshToken,
      { subscriptionId }
    );
  };

  ClientApi.heartbeat = function(origin) {
    return new ClientApi(origin).doRequest('GET', `${origin}/__heartbeat__`);
  };

  function getQueryString(options) {
    const qs = [];

    if (options.keys) {
      qs.push('keys=true');
    }

    if (options.serviceQuery) {
      qs.push(`service=${options.serviceQuery}`);
    }

    if (options.createdAt) {
      qs.push(`_createdAt=${options.createdAt}`);
    }

    if (qs) {
      return `?${qs.join('&')}`;
    } else {
      return '';
    }
  }

  return ClientApi;
};
