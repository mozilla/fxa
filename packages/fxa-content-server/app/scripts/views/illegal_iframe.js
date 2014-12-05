/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The view for users who improperly attempt to load FxA
// into an iframe without being approved.

'use strict';

define([
  'views/base',
  'stache!templates/illegal_iframe'
],
function (BaseView, Template) {
  var View = BaseView.extend({
    template: Template,
    className: 'illegal-iframe'
  });

  return View;
});

