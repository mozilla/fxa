/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A model to hold form pre-fill values. If a user enters an
// email address and password in the sign in screen, then goes to the
// sign up screen, the values they entered in on the sign in screen
// should automatically be filled in.
//
// These values are not persisted across browser sessions.

'use strict';

define([
  'backbone'
], function (Backbone) {

  var FormPrefill = Backbone.Model.extend({
    defaults: {
      email: null,
      password: null,
      year: null
    }
  });

  return FormPrefill;
});


