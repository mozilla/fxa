/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class EmailLinkBuilder {
  constructor() {}

  buildPasswordChangeRequiredLink(opts: {
    url: string;
    email: string;
    emailToHashWith: string;
  }) {
    const link = new URL(opts.url);
    link.searchParams.set('utm_campaign', 'account-locked');
    link.searchParams.set('utm_content', 'fx-account-locked');
    link.searchParams.set('utm_medium', 'email');
    link.searchParams.set('email', opts.email);
    link.searchParams.set('email_to_hash_with', opts.emailToHashWith);
    return link.toString();
  }

  // TOOD: Port remaining link building logic from auth-server!
}
