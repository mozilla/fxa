/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Should the user see web sessions in the apps and devices list in settings
 */
define(function(require, exports, module) {
  'use strict';

  const BaseGroupingRule = require('./base');

  const MIN_FIREFOX_VERSION = 53;

  module.exports = class SentryGroupingRule extends BaseGroupingRule {
    constructor () {
      super();
      this.name = 'sessionsListVisible';
      this.MIN_FIREFOX_VERSION = MIN_FIREFOX_VERSION;
    }

    choose (subject = {}) {
      return subject.firefoxVersion >= MIN_FIREFOX_VERSION;
    }
  };
});
