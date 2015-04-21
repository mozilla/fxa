/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/legal_copy',
  'stache!templates/tos',
  'lib/auth-errors'
],
function (LegalCopyView, Template, AuthErrors) {
  var View = LegalCopyView.extend({
    template: Template,
    className: 'tos',
    copyUrl: '/legal/terms',
    fetchError: AuthErrors.toError('COULD_NOT_GET_TOS'),

    events: {
      'click #fxa-tos-back': 'back',
      'keyup #fxa-tos-back': 'backOnEnter'
    }
  });

  return View;
});

