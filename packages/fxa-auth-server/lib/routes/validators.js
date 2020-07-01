/* eslint-disable no-useless-escape,no-control-regex */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { URL } = require('url');
const punycode = require('punycode.js');
const isA = require('@hapi/joi');

// Match any non-empty hex-encoded string.
const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;
module.exports.HEX_STRING = HEX_STRING;

module.exports.BASE_36 = /^[a-zA-Z0-9]*$/;

// RFC 4648, section 5
module.exports.URL_SAFE_BASE_64 = /^[A-Za-z0-9_-]+$/;

// RFC 7636, section 4.1
module.exports.PKCE_CODE_VERIFIER = /^[A-Za-z0-9-\._~]{43,128}$/;

// Crude phone number validation. The handler code does it more thoroughly.
exports.E164_NUMBER = /^\+[1-9]\d{1,14}$/;

exports.DIGITS = /^[0-9]+$/;

exports.DEVICE_COMMAND_NAME = /^[a-zA-Z0-9._\/\-:]{1,100}$/;

exports.IP_ADDRESS = isA.string().ip();

// Match display-safe unicode characters.
// We're pretty liberal with what's allowed in a unicode string,
// but we exclude the following classes of characters:
//
//   \u0000-\u001F  - C0 (ascii) control characters
//   \u007F         - ascii DEL character
//   \u0080-\u009F  - C1 (ansi escape) control characters
//   \u2028-\u2029  - unicode line/paragraph separator
//   \uD800-\uDFFF  - non-BMP surrogate pairs
//   \uE000-\uF8FF  - BMP private use area
//   \uFFF9-\uFFFF  - unicode "specials" block
//
// We might tweak this list in future.

const DISPLAY_SAFE_UNICODE = /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFF])*$/;
module.exports.DISPLAY_SAFE_UNICODE = DISPLAY_SAFE_UNICODE;

// Similar display-safe match but includes non-BMP characters
const DISPLAY_SAFE_UNICODE_WITH_NON_BMP = /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uE000-\uF8FF\uFFF9-\uFFFF])*$/;
module.exports.DISPLAY_SAFE_UNICODE_WITH_NON_BMP = DISPLAY_SAFE_UNICODE_WITH_NON_BMP;

// Bearer auth header regex
const BEARER_AUTH_REGEX = /^Bearer\s+([a-z0-9+\/]+)$/i;
module.exports.BEARER_AUTH_REGEX = BEARER_AUTH_REGEX;

// Joi validator to match any valid email address.
// This is different to Joi's builtin email validator, and
// requires a custom validation function.

// The custom validators below need to either return the value
// or create an error object using `createError`.
// see examples here: https://github.com/hapijs/joi/blob/master/lib/string.js

module.exports.email = function () {
  const email = isA.string().max(255).regex(DISPLAY_SAFE_UNICODE);
  // Imma add a custom test to this Joi object using internal
  // properties because I can't find a nice API to do that.
  email._tests.push({
    func: function (value, state, options) {
      if (value !== undefined && value !== null) {
        if (module.exports.isValidEmailAddress(value)) {
          return value;
        }
      }

      return email.createError('string.base', { value }, state, options);
    },
  });

  return email;
};

module.exports.service = isA
  .string()
  .max(16)
  .regex(/^[a-zA-Z0-9\-]*$/);
module.exports.hexString = isA.string().regex(HEX_STRING);
module.exports.clientId = module.exports.hexString.length(16);
module.exports.clientSecret = module.exports.hexString;
module.exports.idToken = module.exports.jwt;
module.exports.refreshToken = module.exports.hexString.length(64);
module.exports.sessionToken = module.exports.hexString.length(64);
module.exports.sessionTokenId = module.exports.hexString.length(64);
module.exports.authorizationCode = module.exports.hexString.length(64);
// Note that the empty string is a valid scope value (meaning "no permissions").
module.exports.scope = isA
  .string()
  .max(256)
  .regex(/^[a-zA-Z0-9 _\/.:-]*$/)
  .allow('');
module.exports.assertion = isA
  .string()
  .min(50)
  .max(10240)
  .regex(/^[a-zA-Z0-9_\-\.~=]+$/);
module.exports.pkceCodeChallengeMethod = isA.string().valid('S256');
module.exports.pkceCodeChallenge = isA
  .string()
  .length(43)
  .regex(module.exports.URL_SAFE_BASE_64);
module.exports.pkceCodeVerifier = isA
  .string()
  .min(43)
  .max(128)
  .regex(module.exports.PKCE_CODE_VERIFIER);
module.exports.jwe = isA
  .string()
  .max(1024)
  // JWE token format: 'protectedheader.encryptedkey.iv.cyphertext.authenticationtag'
  .regex(
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
  );

module.exports.jwt = isA
  .string()
  .max(1024)
  // JWT format: 'header.payload.signature'
  .regex(/^([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)$/);

module.exports.accessToken = isA
  .alternatives()
  .try([module.exports.hexString.length(64), module.exports.jwt]);

// Function to validate an email address.
//
// Uses regexes based on the ones in fxa-email-service, tweaked slightly
// because Node's support for unicode regexes is hidden behind a harmony
// flag. As soon as we have default support for unicode regexes, we should
// be able to just use the regex from there directly (and ditch the punycode
// transformation).
//
// https://github.com/mozilla/fxa-email-service/blob/6fc6c31043598b246102cd1fdd27fc325f4514fb/src/validate/mod.rs#L28-L30

const EMAIL_USER = /^[A-Z0-9.!#$%&'*+\/=?^_`{|}~-]{1,64}$/i;
const EMAIL_DOMAIN = /^[A-Z0-9](?:[A-Z0-9-]{0,253}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,253}[A-Z0-9])?)+$/i;

module.exports.isValidEmailAddress = function (value) {
  if (!value) {
    return false;
  }

  const parts = value.split('@');
  if (parts.length !== 2 || parts[1].length > 255) {
    return false;
  }

  if (!EMAIL_USER.test(punycode.toASCII(parts[0]))) {
    return false;
  }

  if (!EMAIL_DOMAIN.test(punycode.toASCII(parts[1]))) {
    return false;
  }

  return true;
};

module.exports.redirectTo = function redirectTo(base) {
  const validator = isA.string().max(512);
  let hostnameRegex = null;
  if (base) {
    hostnameRegex = new RegExp(`(?:\\.|^)${base.replace('.', '\\.')}$`);
  }
  validator._tests.push({
    func: (value, state, options) => {
      if (value !== undefined && value !== null) {
        if (isValidUrl(value, hostnameRegex)) {
          return value;
        }
      }

      return validator.createError('string.base', { value }, state, options);
    },
  });
  return validator;
};

module.exports.url = function url(options) {
  const validator = isA.string().uri(options);
  validator._tests.push({
    func: (value, state, options) => {
      if (value !== undefined && value !== null) {
        if (isValidUrl(value)) {
          return value;
        }
      }

      return validator.createError('string.base', { value }, state, options);
    },
  });
  return validator;
};

// resourceUrls must *not* contain a hash fragment.
// See https://tools.ietf.org/html/draft-ietf-oauth-resource-indicators-02#section-2
module.exports.resourceUrl = module.exports.url().regex(/#/, { invert: true });

module.exports.pushCallbackUrl = function pushUrl(options) {
  const validator = isA.string().uri(options);
  validator._tests.push({
    func: (value, state, options) => {
      if (value !== undefined && value !== null) {
        let normalizedValue = value;
        // Fx Desktop registers https push urls with a :443 which causes `isValidUrl`
        // to fail because the :443 is expected to have been normalized away.
        if (/^https:\/\/[a-zA-Z0-9._-]+(:443)($|\/)/.test(value)) {
          normalizedValue = value.replace(':443', '');
        }

        if (isValidUrl(normalizedValue)) {
          return value;
        }
      }

      return validator.createError('string.base', { value }, state, options);
    },
  });
  return validator;
};

function isValidUrl(url, hostnameRegex) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (err) {
    return false;
  }
  if (hostnameRegex && !hostnameRegex.test(parsed.hostname)) {
    return false;
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return false;
  }
  // Reject anything that won't round-trip unambiguously
  // through a parse.  This puts the onus on the requestor
  // to e.g. escape special characters, normalize ports, etc.
  // The only trick here is that `new URL()` will add a trailing
  // slash if there's no path component, which is why we also
  // compare to `origin` below.
  if (parsed.href !== url && parsed.origin !== url) {
    return false;
  }
  return parsed.href;
}

module.exports.verificationMethod = isA.string().valid([
  'email', // Verification by email link
  'email-otp', // Verification by email otp code using account long code (`emailCode`) as secret
  'email-2fa', // Verification by email code using randomly generated code (used in login flow)
  'email-captcha', // Verification by email code using randomly generated code (used in unblock flow)
  'totp-2fa', // Verification by TOTP authenticator device code, secret is randomly generated
]);

module.exports.authPW = isA.string().length(64).regex(HEX_STRING).required();
module.exports.wrapKb = isA.string().length(64).regex(HEX_STRING);

module.exports.recoveryKeyId = isA.string().regex(HEX_STRING).max(32);
module.exports.recoveryData = isA
  .string()
  .regex(/[a-zA-Z0-9.]/)
  .max(1024)
  .required();

module.exports.subscriptionsSubscriptionId = isA.string().max(255);
module.exports.subscriptionsPlanId = isA.string().max(255);
module.exports.subscriptionsProductId = isA.string().max(255);
module.exports.subscriptionsProductName = isA.string().max(255);
module.exports.subscriptionsPaymentToken = isA.string().max(255);
module.exports.subscriptionPaymentCountryCode = isA
  .string()
  .length(2)
  .allow(null);

// This is fxa-auth-db-mysql's perspective on an active subscription
module.exports.activeSubscriptionValidator = isA.object({
  uid: isA.string().required(),
  subscriptionId: module.exports.subscriptionsSubscriptionId.required(),
  productId: module.exports.subscriptionsProductId.required(),
  createdAt: isA.number().required(),
  cancelledAt: isA.alternatives(isA.number(), isA.any().allow(null)),
});

// This is subhub's perspective on an active subscription
module.exports.subscriptionsSubscriptionValidator = isA.object({
  created: isA.number().required(),
  current_period_end: isA.number().required(),
  current_period_start: isA.number().required(),
  cancel_at_period_end: isA.boolean().required(),
  end_at: isA.alternatives(isA.number(), isA.any().allow(null)),
  failure_code: isA.string().optional(),
  failure_message: isA.string().optional(),
  latest_invoice: isA.string().required(),
  plan_id: module.exports.subscriptionsPlanId.required(),
  product_id: module.exports.subscriptionsProductId.required(),
  product_name: isA.string().required(),
  status: isA.string().required(),
  subscription_id: module.exports.subscriptionsSubscriptionId.required(),
});

// This is support-panel's perspective on a subscription
module.exports.subscriptionsSubscriptionSupportValidator = isA.object({
  created: isA.number().required(),
  current_period_end: isA.number().required(),
  current_period_start: isA.number().required(),
  plan_changed: isA.alternatives(isA.number(), isA.any().allow(null)),
  previous_product: isA.alternatives(isA.string(), isA.any().allow(null)),
  product_name: isA.string().required(),
  status: isA.string().required(),
  subscription_id: module.exports.subscriptionsSubscriptionId.required(),
});

module.exports.subscriptionsSubscriptionListValidator = isA.object({
  subscriptions: isA
    .array()
    .items(module.exports.subscriptionsSubscriptionValidator),
});

// https://mana.mozilla.org/wiki/pages/viewpage.action?spaceKey=COPS&title=SP+Tiered+Product+Support#SPTieredProductSupport-MetadataAgreements
// Trying to be a bit flexible in validation here:
// - subhub may not yet be including product / plan metadata in responses
// - metadata can contain arbitrary keys that we don't expect (e.g. used by other systems)
// - but we can make a good effort at validating what we expect to see when we see it
module.exports.subscriptionPlanMetadataValidator = isA.object().unknown(true);
module.exports.subscriptionProductMetadataValidator = isA
  .object({
    productSet: isA.string().optional(),
    productOrder: isA.number().optional(),
    iconURL: isA.string().optional(),
    upgradeCTA: isA.string().optional(),
    downloadURL: isA.string().optional(),
    appStoreLink: isA.string().optional(),
    playStoreLink: isA.string().optional(),
  })
  .unknown(true);

module.exports.subscriptionsPlanValidator = isA.object({
  plan_id: module.exports.subscriptionsPlanId.required(),
  plan_metadata: module.exports.subscriptionPlanMetadataValidator.optional(),
  product_id: module.exports.subscriptionsProductId.required(),
  product_name: isA.string().required(),
  plan_name: isA.string().allow('').optional(),
  product_metadata: module.exports.subscriptionProductMetadataValidator.optional(),
  interval: isA.string().required(),
  interval_count: isA.number().required(),
  amount: isA.number().required(),
  currency: isA.string().required(),
});

module.exports.subscriptionsCustomerValidator = isA.object({
  billing_name: isA.alternatives(isA.string(), isA.any().allow(null)),
  exp_month: isA.number().required(),
  exp_year: isA.number().required(),
  last4: isA.string().required(),
  payment_type: isA.string().required(),
  brand: isA.string().required(),
  subscriptions: isA
    .array()
    .items(module.exports.subscriptionsSubscriptionValidator)
    .optional(),
});

module.exports.ppidSeed = isA.number().integer().min(0).max(1024);

module.exports.style = isA.string().allow(['trailhead']).optional();

module.exports.newsletters = isA
  .array()
  .items(
    isA
      .string()
      .valid(
        'firefox-accounts-journey',
        'knowledge-is-power',
        'take-action-for-the-internet',
        'test-pilot'
      )
  )
  .default([])
  .optional();
