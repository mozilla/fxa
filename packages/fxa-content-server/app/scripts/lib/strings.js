/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
],
function () {
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

  // Needed for #2451
  t('Edit profile');
  t('Name');

  // Needed for #2757
  t('Bookmarks');
  t('History');
  t('Tabs');
  t('Passwords');
  t('Desktop Add-ons');
  t('Desktop Preferences');

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

  return {
    interpolate: interpolate
  };

});

