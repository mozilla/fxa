/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This module valdiates an email address's domain through DNS lookups as well
 * as display an error/tooltip for the email address field.
 *
 * The validation is performed after the existing account email check during
 * the form submission process. At this point, the email address has gone
 * through: 1) regex validation, 2) common domain autocomplete suggestion (which
 * the user can ignore), and 3) existing email address check.
 *
 * Prior to sending the email domain to the server side, it is checked against
 * a list of known top domains. If the domain is found in the list, then the
 * process is skipped.
 *
 * (Aside: the auto-complete suggestion feature should help with the step above.
 * Hopefully domain resolution based validation will be kept to the very minimum.)
 *
 * There are three possible validation results: 'MX', 'A', and 'none'.
 *  - 'MX': MX record exists, proceed
 *  - 'A': no MX, but A record exists, display tooltip but allow submission
 *  - 'none: neither MX or A records found, block submission
 *
 * If the validation request itself fails, we allow the submission to
 * continue.
 */

import $ from 'jquery';
import AuthErrors from './auth-errors';
import Tooltip from '../views/tooltip';
import TopEmailDomains from './top-email-domains';
import xhr from './xhr';
const t = (msg) => msg;

const EMAIL_VALIDATION_ENDPOINT = '/validate-email-domain';
// This allows us to distinguish between our own rejection and a server error in
// a `catch` that'll catch both.
const REJECTION_CODE = '__INVALID_EMAIL_DOMAIN__';
const MISTYPED_EMAIL_MESSAGE = t('Mistyped email?');

let previousDomain, previousDomainResult;

const resolveDomain = (domain) =>
  xhr.ajax({
    data: { domain },
    type: 'GET',
    url: EMAIL_VALIDATION_ENDPOINT,
  });

const checkEmailDomain = ($element, view) => {
  // The two functions below have their tooltip displaying code wrapped in $()
  // because in cases where the users arrive on the page from an external form
  // (e.g. about:welcome), we need to wait until the email field is in the DOM
  // so the tooltips position can be calculated correctly. Otherwise the tooltip
  // is displayed "on top of" the email field, obscuring the email address.

  const showInvalidDomainError = (domain) => {
    const invalidDomainError = AuthErrors.toInvalidEmailDomainError(domain);
    $(() => view.showValidationError($element, invalidDomainError));
    view.logEvent('emailDomainValidation.fail');
  };

  const showTooltip = () => {
    $(() => {
      const tooltip = new Tooltip({
        dismissible: true,
        extraClassNames: 'tooltip-suggest tooltip-error',
        invalidEl: $element,
        type: 'emailDomainValidation',
        unsafeMessage: MISTYPED_EMAIL_MESSAGE,
      });

      tooltip.on('destroyed', () =>
        view.logEvent('emailDomainValidation.dimissed')
      );
      tooltip.render();
    });
    view.logEvent('emailDomainValidation.fallback');
  };

  return new Promise((resolve, reject) => {
    const emailAddress = $element.val();
    const [, domain] = emailAddress.split('@');

    if (TopEmailDomains.has(domain)) {
      view.logFlowEvent('email-domain-validation.skipped');
      return resolve();
    }

    // User could repeatedly submit the form
    if (previousDomain === domain) {
      // if the previous results is 'A' allow it
      if (previousDomainResult === 'A') {
        view.logFlowEvent('email-domain-validation.ignored');
        return resolve();
      }
      return reject();
    }

    view.logFlowEvent('email-domain-validation.triggered');
    view.logEvent('emailDomainValidation.triggered');

    resolveDomain(domain)
      .then((resp) => {
        const { result } = resp;
        previousDomain = domain;
        previousDomainResult = result;

        if (result === 'MX') {
          view.logEvent('emailDomainValidation.success');
          view.logFlowEvent('email-domain-validation.success');
          return resolve();
        }

        if (result === 'A') {
          showTooltip();
          view.logFlowEvent('email-domain-validation.warn');
          return reject(REJECTION_CODE);
        }

        showInvalidDomainError(domain);
        view.logFlowEvent('email-domain-validation.block');
        reject(REJECTION_CODE);
      })
      .catch((err) => {
        // Do not let a server error stop someone's sign up process
        if (err !== REJECTION_CODE) {
          resolve();
        }

        reject();
      });
  });
};

export default checkEmailDomain;
