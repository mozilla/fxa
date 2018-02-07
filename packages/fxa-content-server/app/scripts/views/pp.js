/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../lib/auth-errors');
  const LegalCopyView = require('./legal_copy');
  const Template = require('templates/pp.mustache');

  var View = LegalCopyView.extend({
    className: 'pp',
    copyUrl: '/legal/privacy',
    events: {
      'click #fxa-pp-back': 'back',
      'keyup #fxa-pp-back': 'backOnEnter'
    },
    fetchError: AuthErrors.toError('COULD_NOT_GET_PP'),
    template: Template
  });

  module.exports = View;
});

