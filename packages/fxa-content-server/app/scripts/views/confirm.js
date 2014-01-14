/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/confirm',
  'lib/session'
],
function (BaseView, ConfirmTemplate, Session) {
  var ConfirmView = BaseView.extend({
    template: ConfirmTemplate,
    className: 'confirm',

    context: function () {
      return {
        email: Session.email
      };
    },

    afterRender: function() {
      // Ugh, kind of sloppy, but the channel is not yet created if the
      // user (or Selenium tests) access this page directly. do a setTimeout
      // to allow page initialization to complete, and then get back
      // to sending the message.
      setTimeout(function() {
        Session.channel.send('login', {
          email: Session.email,
          uid: Session.uid,
          isVerified: Session.verified,
          verified: Session.verified,
          sessionToken: Session.sessionToken,
          unwrapBKey: Session.unwrapBKey,
          keyFetchToken: Session.keyFetchToken
        });
      }, 0);
    }
  });

  return ConfirmView;
});
