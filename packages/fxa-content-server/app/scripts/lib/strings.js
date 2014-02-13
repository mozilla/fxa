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
  //
  // tooltips specified by rfeeley and johngruen
  t('Valid email required');
  t('Valid password required');
  t('Invalid password');
  t('Invalid email and password');
  t('Invalid email or password');
  t('Must be at least 8 characters');
  t('Year of birth required');
  t('Account already exists');
  t('Old password invalid');
  t('New password invalid');
  t('Passwords don\'t match');
  t('Please enter an email');
  t('Cannot connect to the internet');

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

