/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';


  var t = function (msg) {
    return msg;
  };

  // temporary strings that can be extracted for the
  // l10n team to start translations.

  // Was needed by #2346, but later deemed unnecessary. We'll keep it around since
  // it's already being translated and may be used in the future.
  t('By proceeding, you agree to the <a id="service-tos" href="%(termsUri)s">Terms of Service</a> and' +
    '<a id="service-pp" href="%(privacyUri)s">Privacy Notice</a> of %(serviceName)s (%(serviceUri)s).');

  // Allow translators to include "help" links in additional contexts.
  // Including the string here means translators are free to use it
  // without triggering errors from our l10n linting procedure.
  // See e.g. https://bugzilla.mozilla.org/show_bug.cgi?id=1131472
  // for why this could be necessary.
  t('<a href="https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account">Help</a>');

  // Needed for PR #3426, issue #2477
  t('Email address');
  t('Display name');
  t('Account picture');
  t('%(permissionName)s (required)');

  // Needed for Password flow update PR #3559
  t('Enter new password');
  t('Once you submit your new password, you will lose any Sync data that is not on one of your devices.');
  t('Must be at least 8 characters');
  t('Submit new password');
  t('Click on the link we\'ve emailed you at %(email)s within the next hour to create a new password.');
  t('Remember password? Sign in.');
  t('Forgot password');
  t('When you reset your password, you will lose any Sync data that is not on one of your devices.');
  t('Learn how Sync works.');
  t('Reset Password');
  t('Click the button within the next hour to set a new password for your Firefox Account.');
  t('You may need to enter your new password on other devices connected to Firefox Sync.');
  t('Your password has been reset.');
  t('Your Firefox Account password has changed. If you did not change it, please <a href="%(resetPasswordUri)s">reset your password</a> now.');

  /**
   * Replace instances of %s and %(name)s with their corresponding values in
   * the context
   * @method interpolate
   */
  function interpolate(string, context) {
    if (! context) {
      context = [];
    }

    var interpolated = string.replace(/\%s/g, function (match) {
      // boot out non arrays and arrays with not enough items.
      if (! (context.shift && context.length > 0)) {
        return match;
      }
      return context.shift();
    });

    interpolated = interpolated.replace(/\%\(([a-zA-Z]+)\)s/g, function (match, name) {
      return name in context ? context[name] : match;
    });

    return interpolated;
  }

  module.exports = {
    interpolate: interpolate
  };

});

