/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  /** An optional logo url override. This will default to the mozilla logo if not provided.  */
  logoUrl?: string;

  /** An optional logo alt text. This will default to 'Mozilla logo' if not provided.  */
  logoAltText?: string;

  /** An optional logo width. This will default to 120px if not provided. */
  logoWidth?: string;

  /** The current privacy url. */
  privacyUrl: string;

  /** The current support url. */
  supportUrl: string;

  /** The current unsubscribe url. */
  unsubscribeUrl: string;

  /** Whether or not this is a 'sync' specific email. These emails have a slightly different styling */
  sync: boolean;
};
