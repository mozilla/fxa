/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Do some validation.

define(function (require, exports, module) {
  'use strict';

  const Validate = require('lib/validate');
  const Vat = require('vat');

  Vat.register('base64jwt', Vat.string().test(Validate.isBase64JwtValid));
  Vat.register('email', Vat.string().test(Validate.isEmailValid));
  Vat.register('hex', Vat.string().test(Validate.isHexValid));
  Vat.register('uid', Vat.string().test(Validate.isUidValid));
  Vat.register('unblockCode', Vat.string().test(Validate.isUnblockCodeValid));
  Vat.register('url', Vat.string().test(Validate.isUrlValid));
  Vat.register('uuid', Vat.string().test(Validate.isUuidValid));

  return Vat;
});

