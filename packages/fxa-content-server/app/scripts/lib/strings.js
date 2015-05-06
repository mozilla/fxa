/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
],
function () {
  var t = function (msg) {
    return msg;
  };

  // temporary strings that can be extracted for the
  // l10n team to start translations.

  // Intended for email marketing opt-in
  // Should be removed in favor of #992 and #993 when implemented
  t('Subscribe to Firefox news and tips');

  // These can be removed with PR #2382 -
  // the updated spring campaign snippet.
  t('Sign up to learn more');
  t('Firefox is coming soon to iOS!');

  // Strings for the permission screen. Remove when PR #2346 lands.
  t('%(serviceName)s would like to know…');
  t('By proceeding, I agree to the <a id="service-tos" href="%(termsUri)s">Terms of Service</a> and' +
    '<a id="service-pp" href="%(privacyUri)s">Privacy Notice</a> of %(serviceName)s (%(serviceUri)s).');
  t('Proceed');

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

