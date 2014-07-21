/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'views/base',
  'stache!templates/pp',
  'lib/promise',
  'lib/session',
  'lib/strings',
  'lib/auth-errors'
],
function ($, BaseView, Template, p, Session, Strings, AuthErrors) {
  var View = BaseView.extend({
    template: Template,
    className: 'pp',

    context: function () {
      return {
        canGoBack: Session.canGoBack
      };
    },

    afterRender: function () {
      var self = this;
      p.jQueryXHR($.ajax({
        url: Strings.interpolate('/%s/legal/privacy', [Session.language]),
        accepts: {
          text: 'text/partial'
        },
        dataType: 'text'
      }))
      .then(function(template) {
        self.$('#legal-copy').html(template);
        self.$('.hidden').removeClass('hidden');
      })
      .fail(function() {
        var err = AuthErrors.toError('COULD_NOT_GET_PP');
        self.displayError(err);
        self.$('.hidden').removeClass('hidden');
      });
    },

    events: {
      'click #fxa-pp-back': 'back',
      'keyup #fxa-pp-back': 'backOnEnter'
    }
  });

  return View;
});

