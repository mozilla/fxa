/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var Template = require('stache!templates/legal');

  var View = BaseView.extend({
    className: 'legal',
    template: Template
  });

  module.exports = View;
});

