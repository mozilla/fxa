/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Define selectors on a per-screen basis.
 */
define([], function () {
  /*eslint-disable max-len*/
  return {
    FORCE_AUTH: {
      EMAIL: 'input[type=email]',
      HEADER: '#fxa-force-auth-header'
    },
    SETTINGS: {
      HEADER: '#fxa-settings-header',
      PROFILE_HEADER: '#fxa-settings-profile-header .card-header',
      PROFILE_SUB_HEADER: '#fxa-settings-profile-header .card-subheader'
    },
    SIGNIN: {
      EMAIL: 'input[type=email]',
      EMAIL_NOT_EDITABLE: '.prefillEmail',
      HEADER: '#fxa-signin-header',
      PASSWORD: 'input[type=password]'
    },
    SIGNUP: {
      EMAIL: 'input[type=email]',
      HEADER: '#fxa-signup-header',
      LINK_SIGN_IN: 'a#have-account'
    }
  };
  /*eslint-enable max-len*/
});
