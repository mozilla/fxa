/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Model for flow event metadata.
 *
 * Attributes:
 *
 *   - flowId: flow identifier
 *   - flowBeginTime: time at which the flow began
 *   - context: auth-broker context identifier
 *   - entrypoint: user activity entrypoint
 *   - migration: service migration identifier
 *   - service: service or oauth client identifier
 *   - utmCampaign: marketing campaign identifier
 *   - utmContent: content identifier
 *   - utmMedium: marketing campaign medium
 *   - utmSource: traffic source
 *   - utmTerm: search term
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Backbone = require('backbone');

  var INITIAL_ATTRIBUTES = [
    'context',
    'entrypoint',
    'migration',
    'service',
    'utmCampaign',
    'utmContent',
    'utmMedium',
    'utmSource',
    'utmTerm'
  ];

  var DEFAULTS = _.reduce(INITIAL_ATTRIBUTES, function (defaults, key) {
    defaults[key] = undefined;
    return defaults;
  }, {
    flowBeginTime: undefined,
    flowId: undefined
  });

  module.exports = Backbone.Model.extend({
    constructor: function (options) {
      Backbone.Model.call(this);
      this.initialize(options);
    },

    initialize (options) {
      if (options) {
        this.set(_.pick(options, INITIAL_ATTRIBUTES));
      }
    },

    defaults: DEFAULTS
  });
});

