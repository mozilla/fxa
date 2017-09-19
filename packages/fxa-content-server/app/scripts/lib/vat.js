/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Do some validation.

define(function (require, exports, module) {
  'use strict';

  const Validate = require('./validate');
  const Vat = require('vat');

  Vat.register('accessType', Vat.string().test(Validate.isAccessTypeValid));
  Vat.register('codeChallenge', Vat.string().min(43).max(128));
  Vat.register('codeChallengeMethod', Vat.string().valid('S256'));
  Vat.register('email', Vat.string().test(Validate.isEmailValid));
  Vat.register('hex', Vat.string().test(Validate.isHexValid));
  Vat.register('keyFetchToken', Vat.string());
  Vat.register('oauthCode', Vat.string().test(Validate.isOAuthCodeValid));
  Vat.register('password', Vat.string().test(Validate.isPasswordValid));
  Vat.register('prompt', Vat.string().test(Validate.isPromptValid));
  Vat.register('sessionToken', Vat.string());
  Vat.register('token', Vat.string().test(Validate.isTokenValid));
  Vat.register('uid', Vat.string().test(Validate.isUidValid));
  Vat.register('unblockCode', Vat.string().test(Validate.isUnblockCodeValid));
  Vat.register('unwrapBKey', Vat.string());
  Vat.register('url', Vat.string().test(Validate.isUrlValid));
  Vat.register('uuid', Vat.string().test(Validate.isUuidValid));
  Vat.register('verificationCode', Vat.string().test(Validate.isCodeValid));
  Vat.register('verificationRedirect', Vat.string().test(Validate.isVerificationRedirectValid));
  // depends on hex, must come afterwards
  Vat.register('clientId', Vat.hex());

  Vat.any().extend({
    empty (...args) {
      return this.transform((val) => args.indexOf(val) > -1 ? undefined : val);
    }
  });

  return Vat;
});
