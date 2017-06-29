/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BaseView = require('views/base');
  const CannotCreateAccountTemplate = require('stache!templates/cannot_create_account');

  const CannotCreateAccountView = BaseView.extend({
    template: CannotCreateAccountTemplate,
    className: 'cannot-create-account',

    setInitialContext (context) {
      context.set('isSync', this.relier.isSync());
    }

  });

  module.exports = CannotCreateAccountView;
});

