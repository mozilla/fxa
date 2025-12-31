/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';

/**
 * Config chape for transforms
 */
export type EmailAliasConfig = {
  domain: string;
  regex: string;
  replace: string;
};

/**
 * Handles normalization of email addresses
 */
export class EmailNormalization {
  private readonly emailTransforms: Array<EmailAliasConfig>;

  constructor(emailTransforms: string) {
    try {
      const obj = JSON.parse(emailTransforms || '[]');
      // Parse regexes
      this.emailTransforms = obj.map((x: any) => ({
        ...x,
        regex: new RegExp(x.regex),
      }));
    } catch (err) {
      Sentry.captureException(err);
      throw new Error('emailTransforms must be JSON formatted string');
    }
  }

  normalizeEmailAliases(email: string): string {
    email = email?.trim()?.toLocaleLowerCase() || '';
    const parts = email.split('@');
    if (parts?.length !== 2) {
      // Should not happen! If it does, a handler is missing a check.
      // See our joi validator on email for reference.
      throw new Error('Invalid Email!');
    }

    // Apply transforms
    const domain = parts[1];
    email = parts[0];
    this.emailTransforms
      .filter((x) => x.domain === domain)
      .forEach((x) => {
        email = email.replace(x.regex, x.replace);
      });

    return `${email}@${domain}`;
  }
}
