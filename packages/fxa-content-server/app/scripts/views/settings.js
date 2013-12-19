/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/settings'
],
function(BaseView, SettingsTemplate) {
  var SettingsView = BaseView.extend({
    template: SettingsTemplate,
    className: 'settings'
  });

  return SettingsView;
});
