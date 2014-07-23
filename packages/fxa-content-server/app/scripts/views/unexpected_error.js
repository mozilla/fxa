/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a very small view to allow selenium tests
 * to clear browser storage state between tests.
 */

'use strict';

define([
  'views/base',
  'stache!templates/unexpected_error'
],
function (BaseView, Template) {
  var View = BaseView.extend({
    template: Template,
    className: 'unexpected-error'
  });

  return View;
});

