/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A generic broker used to define behaviors when integrating with Sync.
 * Used as a base class for brokers that communicate with Firefox, and
 * when a user verifies in a 2nd browser.
 */

define(function (require, exports, module) {
  'use strict';

  const BaseAuthenticationBroker = require('models/auth_brokers/base');
  const { FX_SYNC_CONTEXT } = require('lib/constants');

  const proto = BaseAuthenticationBroker.prototype;

  module.exports = BaseAuthenticationBroker.extend({
    defaultBehaviors: proto.defaultBehaviors,

    type: FX_SYNC_CONTEXT
  });
});

