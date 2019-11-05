/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const t = msg => msg;

const HTML_CHAR_CODE = /&(\D+|#\d+);/i;
const HTML_TAG = /<.*>/;
const NAMED_VARIABLE = /\%\(([a-zA-Z]+)\)s/g;
const UNNAMED_VARIABLE = /%s/g;
// safe variables have an `escaped` prefix.
const UNSAFE_VARIABLE = /\%\(((?!escaped)[a-zA-Z]+)\)s/g;

// temporary strings that can be extracted for the
// l10n team to start translations.

// Was needed by #2346, but later deemed unnecessary. We'll keep it around since
// it's already being translated and may be used in the future.
t(
  'By proceeding, you agree to the <a id="service-tos" href="%(termsUri)s">Terms of Service</a> and' +
    '<a id="service-pp" href="%(privacyUri)s">Privacy Notice</a> of %(serviceName)s (%(serviceUri)s).'
);

// Allow translators to include "help" links in additional contexts.
// Including the string here means translators are free to use it
// without triggering errors from our l10n linting procedure.
// See e.g. https://bugzilla.mozilla.org/show_bug.cgi?id=1131472
// for why this could be necessary.
t(
  '<a href="https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account">Help</a>'
);

// We're temporarily changing the string for marketing optin, see #3792.
// This keeps the old string around for if/when we need to change it back.
t('Get the latest news about Mozilla and Firefox.');

// We are adding this in the auth-mailer for displaying location data
t('%(city)s, %(country)s (estimated)');
t('%(country)s (estimated)');
t('IP address: %(ip)s');
t(
  'For added security, please confirm this sign-in to begin syncing with this device:'
);

// For #3128, PR #4916 - We added a 'msgctxt' comment to these buttons
// to allow the l10n team differentiate between headers and buttons. This
// string is kept and used as a fallback for locales that have it
// translated but have not yet translated the contextualized variant.
t('Sign in');

/**
 * Replace instances of %s and %(name)s with their corresponding values in
 * the context
 * @method interpolate
 * @param {String} string
 * @param {Object|Array} [context] - defaults to []
 * @returns {String}
 */
function interpolate(string, context = []) {
  return string
    .replace(UNNAMED_VARIABLE, match => {
      // boot out non arrays and arrays with not enough items.
      if (! (context.shift && context.length > 0)) {
        return match;
      }
      return context.shift();
    })
    .replace(NAMED_VARIABLE, (match, name) => {
      return name in context ? context[name] : match;
    });
}

/**
 * Check whether the string contains HTML. Very very loose interpretation of
 * what HTML means. If it contains an HTML character code-like thing, it's
 * considered HTML. If it contains <> with *anything* in the middle, it's
 * considered HTML.
 *
 * @param {String} string
 * @returns {Boolean} true if string has HTML, false otw.
 */
function hasHTML(string) {
  return HTML_CHAR_CODE.test(string) || HTML_TAG.test(string);
}

/**
 * Check whether all interpolation variables have an `escaped` prefix.
 * This is a gentle reminder to developers that they must properly escape
 * variables because the string is written to the DOM w/o HTML escaping.
 *
 * @param {String} string
 * @returns {Boolean} true if has unsafe variables, false otw.
 */
function hasUnsafeVariables(string) {
  return UNNAMED_VARIABLE.test(string) || UNSAFE_VARIABLE.test(string);
}

export default {
  hasHTML,
  hasUnsafeVariables,
  interpolate,
};
