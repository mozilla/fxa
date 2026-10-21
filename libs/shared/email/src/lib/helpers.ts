/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mozmail.com is the Firefox Relay email mask, we prohibit creating accounts with it
const emailMaskRegex = /@([a-zA-Z0-9.-]+\.)?(mozmail|relay\.firefox)\.(com)$/i;

export function normalizeEmail(originalEmail: string): string {
  return originalEmail.toLowerCase();
}

export function emailsMatch(firstEmail: string, secondEmail: string): boolean {
  // This has traditionally been our comparison method
  return firstEmail.toLowerCase() === secondEmail.toLowerCase();

  // Down the road we should switch to something like this
  // that allows comparison with better unicode support
  // https://github.com/mozilla/fxa/pull/4736#discussion_r402647434
  //
  // return (
  //   firstEmail.localeCompare(secondEmail, undefined, {
  //     // We use 'accent' instead of 'base' here to ensure a character with
  //     // an accent is not considered the same as that character without one
  //     sensitivity: 'accent',
  //   }) === 0
  // );
}

// Email regex, accepts punycoded addresses. See:
//   * http://blog.gerv.net/2011/05/html5_email_address_regexp/
// Modifications:
//   * Use case-insensitive regex, delete explicit `A-Z` ranges
//   * Replace `0-9` ranges with `\d`
//   * Replace `a-z` range and `_` in local part with `\w`
//   * Replace `+` in local part with {1,64}
//   * Replace final domain part `*` with `+`, to enforce at least one period
//     in the domain (https://github.com/mozilla/fxa-content-server/issues/2199)
// IETF spec:
//   * http://tools.ietf.org/html/rfc5321#section-4.5.3.1.1
// '/' in the character class is (redundantly) backslash-escaped to produce
// the same minimized form in node 4.x and node 0.10.
const emailRegex =
  /^[\w.!#$%&'*+\/=?^`{|}~-]{1,64}@[a-z\d](?:[a-z\d-]{0,253}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,253}[a-z\d])?)+$/i;

/**
 * Check if an email address is valid
 * @param {String} email
 * @return {Boolean} true if email is valid, false otw.
 */
export function isEmailValid(email: string): boolean {
  if (email.length > 256) {
    return false;
  }

  // At this point, we could punycode the email and pass it to
  // the regex, thus validating unicode addresses. However, doing
  // that would break Firefox versions 45 and lower, because of
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1243594. So, in
  // order to support unicode email addresses in the future, we'll
  // have to pass the punycoded address in all our dealings with
  // the browser and the non-punycoded address in our dealings with
  // the auth server. :-/

  return emailRegex.test(email);
}

/**
 * Check if an email address is an email mask. Currently, the only email mask
 * we check is mozmail.com, relay.firefox.com and *.mozmail.com from Firefox Relay.
 *
 * @param {String} email
 * @return {Boolean} true if email is mask, false otw.
 */
export function isEmailMask(email: string): boolean {
  return emailMaskRegex.test(email);
}
