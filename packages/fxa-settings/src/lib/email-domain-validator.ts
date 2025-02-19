/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthUiErrors } from './auth-errors/auth-errors';
import topEmailDomains from 'fxa-shared/email/topEmailDomains';
import { resolveDomain } from './email-domain-validator-resolve-domain';

let previousDomain: string | undefined;
let previousDomainResult: string | undefined;

/**
 * This validates an email address's domain through DNS lookups.
 *
 * The validation is performed after the existing account email check during
 * the form submission process. At this point, the email address has gone
 * through: 1) regex validation, 2) an email mask check, and 3) existing
 * email address check.
 *
 * Prior to sending the email domain to the server side, it is checked against
 * a list of known top domains. If the domain is found in the list, then the
 * process is skipped.
 *
 * There are three possible validation results: 'MX', 'A', and 'none'.
 *  - 'MX': MX record exists, proceed
 *  - 'A': no MX, but A record exists, display tooltip but allow submission
 *  - 'none: neither MX or A records found, block submission
 *
 * If the validation request itself fails, we allow the submission to
 * continue.
 */
export const checkEmailDomain = async (email: string) => {
  const [, domain] = email.split('@');
  // This should have already been checked, but it's an extra sanity check
  if (!domain) {
    throw AuthUiErrors.EMAIL_REQUIRED;
  }

  if (topEmailDomains.has(domain)) {
    // Glean / FXA-11292: email-domain-validation.skipped
    return;
  }

  // User could repeatedly submit the form
  if (previousDomain === domain) {
    // if the previous result is 'A' or 'MX', allow it
    if (previousDomainResult === 'A' || previousDomainResult === 'MX') {
      // Glean / FXA-11292: for A - email-domain-validation.ignored
      return;
    }
    throw AuthUiErrors.INVALID_EMAIL_DOMAIN;
  }

  // Glean / FXA-11292: email-domain-validation.triggered

  let resp;
  try {
    resp = await resolveDomain(domain);
    if (!resp) {
      // Don't error and allow submission in case of server failure
      return;
    }
  } catch (error) {
    // Don't error and allow submission in case of server failure
    return;
  }

  const { result } = resp;
  previousDomain = domain;
  previousDomainResult = result;

  switch (result) {
    case 'MX':
      // Glean / FXA-11292: emailDomainValidation.success, email-domain-validation.success
      return;
    case 'A':
      // Glean / FXA-11292: email-domain-validation.warn
      throw AuthUiErrors.MX_LOOKUP_WARNING;
    case 'skip':
      return;
    default:
      // Glean / FXA-11292: email-domain-validation.block
      throw AuthUiErrors.INVALID_EMAIL_DOMAIN;
  }
};
