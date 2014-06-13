/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'views/base',
  'stache!templates/tos',
  'lib/session',
  'lib/strings',
  'lib/auth-errors'
],
function ($, BaseView, Template, Session, Strings, AuthErrors) {
  var View = BaseView.extend({
    template: Template,
    className: 'tos',

    context: function () {
      return {
        canGoBack: Session.canGoBack
      };
    },

    afterRender: function () {
      var self = this;
      $.ajax({
        url: Strings.interpolate('/%s/legal/terms', [Session.language]),
        accepts: {
          text: 'text/partial'
        },
        dataType: 'text'
      })
      .done(function(template) {
        self.$('#legal-copy').html(template);
        self.$('.hidden').removeClass('hidden');
      })
      .fail(function() {
        var err = AuthErrors.toError('COULD_NOT_GET_TOS');
        self.displayError(err);
        self.$('.hidden').removeClass('hidden');
      })
      .always(function() {
        self.trigger('ready');
      });
    },

    events: {
      'click #fxa-tos-back': 'back',
      'keyup #fxa-tos-back': 'backOnEnter'
    }
  });

  return View;
});

