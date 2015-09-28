/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'views/legal_copy',
  'stache!templates/pp',
  'lib/auth-errors'
],
function (LegalCopyView, Template, AuthErrors) {
  'use strict';

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

  return View;
});

