/* eslint-disable no-useless-escape,no-control-regex */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { URL } = require('url');
const punycode = require('punycode.js');
const isA = require('joi');
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const {
  minimalConfigSchema,
} = require('fxa-shared/subscriptions/configuration/base');
const {
  productConfigJoiKeys,
} = require('fxa-shared/subscriptions/configuration/product');
const {
  planConfigJoiKeys,
} = require('fxa-shared/subscriptions/configuration/plan');
const {
  appStoreSubscriptionSchema,
  playStoreSubscriptionSchema,
} = require('fxa-shared/dto/auth/payments/iap-subscription');
const {
  latestInvoiceItemsSchema,
} = require('fxa-shared/dto/auth/payments/invoice');
const {
  default: DESCRIPTIONS,
} = require('../../docs/swagger/shared/descriptions');
const {
  subscriptionProductMetadataBaseValidator,
  capabilitiesClientIdPattern,
} = require('fxa-shared/subscriptions/validation');
const {
  VX_REGEX: CLIENT_SALT_STRING,
} = require('../../lib/routes/utils/client-key-stretch');
const { ReasonForDeletion } = require('./cloud-tasks');

// Match any non-empty hex-encoded string.
const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;
module.exports.HEX_STRING = HEX_STRING;

module.exports.BASE_36 = /^[a-zA-Z0-9]*$/;
module.exports.BASE_10 = /^[0-9]*$/;

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
//   \uFFF9-\uFFFC  - unicode specials prior to the replacement character
//   \uFFFE-\uFFFF  - unicode this-is-not-a-character specials
//
// Note that the unicode replacement character \uFFFD is explicitly allowed,
// and clients may use it to replace other disallowed characters.
//
// We might tweak this list in future.

const DISPLAY_SAFE_UNICODE =
  /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFC\uFFFE-\uFFFF])*$/;
module.exports.DISPLAY_SAFE_UNICODE = DISPLAY_SAFE_UNICODE;

// Similar display-safe match but includes non-BMP characters
const DISPLAY_SAFE_UNICODE_WITH_NON_BMP =
  /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uE000-\uF8FF\uFFF9-\uFFFC\uFFFE-\uFFFF])*$/;
module.exports.DISPLAY_SAFE_UNICODE_WITH_NON_BMP =
  DISPLAY_SAFE_UNICODE_WITH_NON_BMP;

// Bearer auth header regex
const BEARER_AUTH_REGEX = /^Bearer\s+([a-z0-9+\/]+)$/i;
module.exports.BEARER_AUTH_REGEX = BEARER_AUTH_REGEX;

// Joi validator to match any valid email address.
// This is different to Joi's builtin email validator, and
// requires a custom validation function.

module.exports.email = function () {
  const email = isA
    .string()
    .max(255)
    .regex(DISPLAY_SAFE_UNICODE)
    .custom((value) => {
      // Do custom validation
      const isValid = module.exports.isValidEmailAddress(value);

      if (!isValid) {
        throw new Error('Not a valid email address');
      }
      return value;
    });

  return email;
};

module.exports.service = isA
  .string()
  .max(16)
  .regex(/^[a-zA-Z0-9\-]*$/);
module.exports.hexString = isA.string().regex(HEX_STRING);
module.exports.uid = module.exports.hexString.length(32);
module.exports.clientId = module.exports.hexString.length(16);
module.exports.clientSecret = module.exports.hexString;
module.exports.idToken = module.exports.jwt;
module.exports.reasonForAccountDeletion = isA
  .string()
  .valid(...Object.values(ReasonForDeletion));
module.exports.refreshToken = module.exports.hexString.length(64);
module.exports.sessionToken = module.exports.hexString.length(64);
module.exports.sessionTokenId = module.exports.hexString.length(64);
module.exports.authorizationCode = module.exports.hexString.length(64);
// Note that the empty string is a valid scope value (meaning "no permissions").
const scope = isA
  .string()
  .max(256)
  .regex(/^[a-zA-Z0-9 _\/.:-]*$/)
  .allow('');
module.exports.scope = scope;
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
  .try(module.exports.hexString.length(64), module.exports.jwt);

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
const EMAIL_DOMAIN =
  /^[A-Z0-9](?:[A-Z0-9-]{0,253}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,253}[A-Z0-9])?)+$/i;

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
  const validator = isA
    .string()
    .max(2048)
    .custom((value) => {
      let hostnameRegex = '';
      if (base) {
        hostnameRegex = new RegExp(`(?:\\.|^)${base.replaceAll('.', '\\.')}$`);
      }
      // Do your validation
      const isValid = isValidUrl(value, hostnameRegex);

      if (!isValid) {
        throw new Error('Not a valid URL');
      }
      return value;
    });
  return validator;
};

module.exports.url = function url(options) {
  const validator = isA
    .string()
    .uri(options)
    .custom((value) => {
      const isValid = isValidUrl(value);
      if (!isValid) {
        throw new Error('Not a valid URL');
      }
      return value;
    });
  return validator;
};

// resourceUrls must *not* contain a hash fragment.
// See https://tools.ietf.org/html/draft-ietf-oauth-resource-indicators-02#section-2
module.exports.resourceUrl = module.exports.url().regex(/#/, { invert: true });

module.exports.pushCallbackUrl = function pushUrl(options) {
  const validator = isA
    .string()
    .uri(options)
    .custom((value) => {
      let normalizedValue = value;
      // Fx Desktop registers https push urls with a :443 which causes `isValidUrl`
      // to fail because the :443 is expected to have been normalized away.
      if (/^https:\/\/[a-zA-Z0-9._-]+(:443)($|\/)/.test(value)) {
        normalizedValue = value.replace(':443', '');
      }
      const isValid = isValidUrl(normalizedValue);
      if (!isValid) {
        throw new Error('Not a valid URL');
      }
      return value;
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

module.exports.verificationMethod = isA.string().valid(
  'email', // Verification by email link
  'email-otp', // Verification by email otp code using account long code (`emailCode`) as secret
  'email-2fa', // Verification by email code using randomly generated code (used in login flow)
  'email-captcha', // Verification by email code using randomly generated code (used in unblock flow)
  'totp-2fa' // Verification by TOTP authenticator device code, secret is randomly generated
);

module.exports.authPW = isA.string().length(64).regex(HEX_STRING).required();
module.exports.wrapKb = isA.string().length(64).regex(HEX_STRING);
module.exports.authPWVersion2 = isA.string().length(64).regex(HEX_STRING);
module.exports.clientSalt = isA.string().regex(CLIENT_SALT_STRING);

module.exports.recoveryKeyId = isA.string().regex(HEX_STRING).max(32);
module.exports.recoveryData = isA
  .string()
  .regex(/[a-zA-Z0-9.]/)
  .max(1024)
  .required();

module.exports.recoveryKeyHint = isA
  .string()
  .max(255)
  .regex(DISPLAY_SAFE_UNICODE);

module.exports.recoveryCode = function (len, base) {
  const regex = base || module.exports.BASE_36;
  return isA.string().regex(regex).min(8).max(len);
};
module.exports.recoveryCodes = function (codeCount, codeLen, base) {
  return isA.object({
    recoveryCodes: isA
      .array()
      .min(1)
      .max(codeCount)
      .unique()
      .items(module.exports.recoveryCode(codeLen, base))
      .required(),
  });
};

module.exports.stripePaymentMethodId = isA.string().max(30);
module.exports.paypalPaymentToken = isA.string().max(30);
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
  uid: isA.string().required().description(DESCRIPTIONS.uid),
  subscriptionId: module.exports.subscriptionsSubscriptionId
    .required()
    .description(DESCRIPTIONS.subscriptionId),
  productId: module.exports.subscriptionsProductId
    .required()
    .description(DESCRIPTIONS.productId),
  createdAt: isA.number().required().description(DESCRIPTIONS.createdAt),
  cancelledAt: isA
    .alternatives(isA.number(), isA.any().allow(null))
    .description(DESCRIPTIONS.cancelledAt),
});

module.exports.subscriptionsSetupIntent = isA
  .object({
    client_secret: isA
      .string()
      .required()
      .description(DESCRIPTIONS.clientSecret),
  })
  .unknown(true);

// This is a Stripe subscription object with latest_invoice.payment_intent expanded
module.exports.subscriptionsSubscriptionExpandedValidator = isA
  .object({
    id: isA.string().required(),
    object: isA.string().allow('subscription').required(),
    latest_invoice: isA
      .object({
        id: isA.string().required(),
        object: isA.string().allow('invoice').required(),
        payment_intent: isA
          .object({
            id: isA.string().required(),
            object: isA.string().allow('payment_intent').required(),
            client_secret: isA.string().required(),
          })
          .unknown(true)
          .required(),
      })
      .unknown(true)
      .required()
      .description(DESCRIPTIONS.latestInvoice),
  })
  .unknown(true);

module.exports.subscriptionsInvoicePIExpandedValidator = isA
  .object({
    id: isA.string().required(),
    object: isA.string().allow('invoice').required(),
    payment_intent: isA
      .object({
        id: isA.string().required(),
        object: isA.string().allow('payment_intent').required(),
        client_secret: isA.string().required(),
      })
      .unknown(true)
      .required(),
  })
  .unknown(true);

module.exports.subscriptionsSubscriptionValidator = isA.object({
  _subscription_type: MozillaSubscriptionTypes.WEB,
  created: isA.number().required().description(DESCRIPTIONS.createdAt),
  current_period_end: isA
    .number()
    .required()
    .description(DESCRIPTIONS.currentPeriodEnd),
  current_period_start: isA
    .number()
    .required()
    .description(DESCRIPTIONS.currentPeriodStart),
  cancel_at_period_end: isA
    .boolean()
    .required()
    .description(DESCRIPTIONS.cancelAtPeriodEnd),
  end_at: isA.alternatives(isA.number(), isA.any().allow(null)),
  failure_code: isA.string().optional().description(DESCRIPTIONS.failureCode),
  failure_message: isA
    .string()
    .optional()
    .description(DESCRIPTIONS.failureMessage),
  latest_invoice: isA
    .string()
    .required()
    .description(DESCRIPTIONS.latestInvoice),
  latest_invoice_items: latestInvoiceItemsSchema.required(),
  plan_id: module.exports.subscriptionsPlanId
    .required()
    .description(DESCRIPTIONS.planId),
  product_id: module.exports.subscriptionsProductId
    .required()
    .description(DESCRIPTIONS.productId),
  product_name: isA.string().required().description(DESCRIPTIONS.productName),
  status: isA.string().required().description(DESCRIPTIONS.status),
  subscription_id: module.exports.subscriptionsSubscriptionId
    .required()
    .description(DESCRIPTIONS.subscriptionId),
  promotion_amount_off: isA
    .number()
    .integer()
    .min(0)
    .optional()
    .allow(null)
    .description(DESCRIPTIONS.promotionAmountOff),
  promotion_code: isA
    .string()
    .optional()
    .allow(null)
    .description(DESCRIPTIONS.promotionCode),
  promotion_duration: isA
    .string()
    .optional()
    .allow(null)
    .description(DESCRIPTIONS.promotionDuration),
  promotion_end: isA
    .number()
    .optional()
    .allow(null)
    .description(DESCRIPTIONS.promotionEnd),
  promotion_name: isA
    .string()
    .optional()
    .allow(null)
    .description(DESCRIPTIONS.promotionName),
  promotion_percent_off: isA
    .number()
    .min(0)
    .max(100)
    .optional()
    .allow(null)
    .description(DESCRIPTIONS.promotionPercentOff),
});

// This is support-panel's perspective on a subscription
module.exports.subscriptionsWebSubscriptionSupportValidator = isA
  .object({
    created: isA.number().required().description(DESCRIPTIONS.createdAt),
    current_period_end: isA
      .number()
      .required()
      .description(DESCRIPTIONS.currentPeriodEnd),
    current_period_start: isA
      .number()
      .required()
      .description(DESCRIPTIONS.currentPeriodStart),
    plan_changed: isA.alternatives(isA.number(), isA.any().allow(null)),
    previous_product: isA
      .alternatives(isA.string(), isA.any().allow(null))
      .description(DESCRIPTIONS.previousProduct),
    product_name: isA.string().required().description(DESCRIPTIONS.productName),
    status: isA.string().required().description(DESCRIPTIONS.status),
    subscription_id: module.exports.subscriptionsSubscriptionId
      .required()
      .description(DESCRIPTIONS.subscriptionId),
  })
  .unknown(true);

module.exports.subscriptionsPlaySubscriptionSupportValidator = isA
  .object({
    _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
    auto_renewing: isA.bool().required(),
    cancel_reason: isA.number().optional(),
    expiry_time_millis: isA.number().required(),
    package_name: isA.string().optional(),
    price_id: isA.string().optional(),
    product_id: isA.string().optional(),
    product_name: isA.string().required(),
    sku: isA.string().optional(),
  })
  .unknown(true);

module.exports.subscriptionsAppStoreSubscriptionSupportValidator = isA
  .object({
    _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
    app_store_product_id: isA.string().required(),
    auto_renewing: isA.bool().required(),
    bundle_id: isA.string().required(),
    expiry_time_millis: isA.number().optional(),
    is_in_billing_retry_period: isA.boolean().optional(),
    price_id: isA.string().optional(),
    product_id: isA.string().optional(),
    product_name: isA.string().required(),
  })
  .unknown(true);

module.exports.subscriptionsSubscriptionSupportValidator = isA.object({
  [MozillaSubscriptionTypes.WEB]: isA
    .array()
    .items(module.exports.subscriptionsWebSubscriptionSupportValidator),
  [MozillaSubscriptionTypes.IAP_GOOGLE]: isA
    .array()
    .items(module.exports.subscriptionsPlaySubscriptionSupportValidator),
  [MozillaSubscriptionTypes.IAP_APPLE]: isA
    .array()
    .items(module.exports.subscriptionsAppStoreSubscriptionSupportValidator),
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

module.exports.subscriptionProductMetadataValidator = {
  validate: function (metadata) {
    const hasCapability = Object.keys(metadata).some((k) =>
      capabilitiesClientIdPattern.test(k)
    );

    if (!hasCapability) {
      return {
        error: 'Capability missing from metadata',
      };
    }

    const { value: result, error } =
      subscriptionProductMetadataBaseValidator.validate(metadata, {
        abortEarly: false,
      });

    if (error) {
      return { error };
    }

    return { result };
  },
  async validateAsync(metadata) {
    const hasCapability = Object.keys(metadata).some((k) =>
      capabilitiesClientIdPattern.test(k)
    );

    if (!hasCapability) {
      return {
        error: 'Capability missing from metadata',
      };
    }

    try {
      const validationSchema = subscriptionProductMetadataBaseValidator;
      const value = await validationSchema.validateAsync(metadata, {
        abortEarly: false,
      });
      return { value };
    } catch (error) {
      return { error };
    }
  },
};

module.exports.subscriptionsPlanWithMetaDataValidator = isA.object({
  plan_id: module.exports.subscriptionsPlanId
    .required()
    .description(DESCRIPTIONS.planId),
  plan_metadata: module.exports.subscriptionPlanMetadataValidator
    .optional()
    .description(DESCRIPTIONS.planMetadata),
  product_id: module.exports.subscriptionsProductId
    .required()
    .description(DESCRIPTIONS.productId),
  product_name: isA.string().required().description(DESCRIPTIONS.productName),
  plan_name: isA
    .string()
    .allow('')
    .optional()
    .description(DESCRIPTIONS.planName),
  product_metadata: subscriptionProductMetadataBaseValidator
    .optional()
    .description(DESCRIPTIONS.productMetadata),
  interval: isA.string().required().description(DESCRIPTIONS.interval),
  interval_count: isA
    .number()
    .required()
    .description(DESCRIPTIONS.intervalCount),
  amount: isA.number().required().description(DESCRIPTIONS.amount),
  currency: isA.string().required().description(DESCRIPTIONS.currency),
  active: isA.boolean().required().description(DESCRIPTIONS.activePrice),
  configuration: minimalConfigSchema
    .keys(productConfigJoiKeys)
    .keys(planConfigJoiKeys)
    .optional()
    .allow(null),
});

module.exports.subscriptionsPlanWithProductConfigValidator = isA.object({
  plan_id: module.exports.subscriptionsPlanId
    .required()
    .description(DESCRIPTIONS.planId),
  plan_metadata: isA.object().optional().description(DESCRIPTIONS.planMetadata),
  product_id: module.exports.subscriptionsProductId
    .required()
    .description(DESCRIPTIONS.productId),
  product_name: isA.string().required().description(DESCRIPTIONS.productName),
  plan_name: isA
    .string()
    .allow('')
    .optional()
    .description(DESCRIPTIONS.planName),
  product_metadata: isA
    .object()
    .optional()
    .description(DESCRIPTIONS.productMetadata),
  interval: isA.string().required().description(DESCRIPTIONS.interval),
  interval_count: isA
    .number()
    .required()
    .description(DESCRIPTIONS.intervalCount),
  amount: isA.number().required().description(DESCRIPTIONS.amount),
  currency: isA.string().required().description(DESCRIPTIONS.currency),
  active: isA.boolean().required().description(DESCRIPTIONS.activePrice),
  configuration: minimalConfigSchema
    .keys(productConfigJoiKeys)
    .keys(planConfigJoiKeys)
    .required(),
});

module.exports.customerId = isA
  .string()
  .optional()
  .description(DESCRIPTIONS.customerId);
module.exports.subscriptionsCustomerValidator = isA.object({
  customerId: module.exports.customerId,
  billing_name: isA
    .alternatives(isA.string(), isA.any().allow(null))
    .optional()
    .description(DESCRIPTIONS.billingName),
  exp_month: isA.number().optional().description(DESCRIPTIONS.expMonth),
  exp_year: isA.number().optional().description(DESCRIPTIONS.expYear),
  last4: isA.string().optional().description(DESCRIPTIONS.last4),
  payment_provider: isA
    .string()
    .optional()
    .description(DESCRIPTIONS.paymentProvider),
  payment_type: isA.string().optional().description(DESCRIPTIONS.paymentType),
  paypal_payment_error: isA
    .string()
    .optional()
    .description(DESCRIPTIONS.paypalPaymentError),
  brand: isA.string().optional().description(DESCRIPTIONS.brand),
  billing_agreement_id: isA
    .alternatives(isA.string(), isA.any().allow(null))
    .optional()
    .description(DESCRIPTIONS.billingAgreementId),
  subscriptions: isA
    .array()
    .items(module.exports.subscriptionsSubscriptionValidator)
    .optional()
    .description(DESCRIPTIONS.subscriptions),
});

module.exports.subscriptionsStripeIntentValidator = isA
  .object({
    client_secret: isA
      .string()
      .optional()
      .description(DESCRIPTIONS.clientSecret),
    created: isA.number().required().description(DESCRIPTIONS.createdAt),
    payment_method: isA
      .alternatives(isA.string(), isA.object({}).unknown(true))
      .optional()
      .allow(null),
    source: isA.alternatives().conditional('payment_method', {
      // cannot be that strict here since this validator is used in two routes
      is: null,
      then: isA.string().optional(),
      otherwise: isA.any().optional().allow(null),
    }),
    status: isA.string().required().description(DESCRIPTIONS.status),
  })
  .unknown(true);

module.exports.subscriptionsStripeSourceValidator = isA
  .object({
    id: isA.string().required(),
    object: isA.string().required(),
    brand: isA.string().optional().description(DESCRIPTIONS.brand),
    exp_month: isA.string().optional().description(DESCRIPTIONS.expMonth),
    exp_year: isA.string().optional().description(DESCRIPTIONS.expYear),
    last4: isA.string().optional().description(DESCRIPTIONS.last4),
  })
  .unknown(true);

module.exports.subscriptionsStripeInvoiceValidator = isA
  .object({
    id: isA.string().required(),
    payment_intent: isA
      .alternatives(
        isA.string().allow(null),
        module.exports.subscriptionsStripeIntentValidator
      )
      .optional(),
  })
  .unknown(true);

module.exports.subscriptionsStripePriceValidator = isA
  .object({
    id: isA.string().required(),
  })
  .unknown(true);

module.exports.subscriptionsStripeSubscriptionItemValidator = isA
  .object({
    id: isA.string().required(),
    created: isA.number().required(),
    price: module.exports.subscriptionsStripePriceValidator.required(),
  })
  .unknown(true);

module.exports.subscriptionsStripeSubscriptionValidator = isA
  .object({
    id: isA.string().required(),
    cancel_at: isA.alternatives(isA.number(), isA.any().valid(null)),
    canceled_at: isA
      .alternatives(isA.number(), isA.any().valid(null))
      .description(DESCRIPTIONS.cancelledAt),
    cancel_at_period_end: isA
      .bool()
      .required()
      .description(DESCRIPTIONS.cancelAtPeriodEnd),
    created: isA.number().required().description(DESCRIPTIONS.createdAt),
    current_period_end: isA
      .number()
      .required()
      .description(DESCRIPTIONS.currentPeriodEnd),
    current_period_start: isA
      .number()
      .required()
      .description(DESCRIPTIONS.currentPeriodStart),
    ended_at: isA.alternatives(isA.number(), isA.any().valid(null)),
    items: isA
      .object({
        data: isA
          .array()
          .items(module.exports.subscriptionsStripeSubscriptionItemValidator)
          .required(),
      })
      .unknown(true)
      .optional(),
    latest_invoice: isA
      .alternatives(
        isA.string(),
        module.exports.subscriptionsStripeInvoiceValidator
      )
      .optional(),
    status: isA.string().required().description(DESCRIPTIONS.status),
  })
  .unknown(true);

module.exports.subscriptionsGooglePlaySubscriptionValidator =
  playStoreSubscriptionSchema;

module.exports.subscriptionsAppStoreSubscriptionValidator =
  appStoreSubscriptionSchema;

module.exports.subscriptionsStripeCustomerValidator = isA
  .object({
    invoices_settings: isA
      .object({
        default_payment_method: isA.string().optional(),
      })
      .unknown(true)
      .optional(),
    subscriptions: isA
      .object({
        data: isA
          .array()
          .items(module.exports.subscriptionsStripeSubscriptionValidator)
          .required(),
      })
      .unknown(true)
      .optional(),
  })
  .unknown(true);

module.exports.subscriptionsMozillaSubscriptionsValidator = isA
  .object({
    customerId: module.exports.customerId,
    billing_name: isA
      .alternatives(isA.string(), isA.any().allow(null))
      .optional()
      .description(DESCRIPTIONS.billingName),
    exp_month: isA.number().optional().description(DESCRIPTIONS.expMonth),
    exp_year: isA.number().optional().description(DESCRIPTIONS.expYear),
    last4: isA.string().optional().description(DESCRIPTIONS.last4),
    payment_provider: isA
      .string()
      .optional()
      .description(DESCRIPTIONS.paymentProvider),
    payment_type: isA.string().optional().description(DESCRIPTIONS.paymentType),
    paypal_payment_error: isA
      .string()
      .optional()
      .description(DESCRIPTIONS.paypalPaymentError),
    brand: isA.string().optional().description(DESCRIPTIONS.brand),
    billing_agreement_id: isA
      .alternatives(isA.string(), isA.any().allow(null))
      .optional()
      .description(DESCRIPTIONS.billingAgreementId),
    subscriptions: isA
      .array()
      .items(
        module.exports.subscriptionsSubscriptionValidator,
        module.exports.subscriptionsGooglePlaySubscriptionValidator,
        module.exports.subscriptionsAppStoreSubscriptionValidator
      )
      .required()
      .description(DESCRIPTIONS.subscriptions),
  })
  .unknown(true);

module.exports.ppidSeed = isA.number().integer().min(0).max(1024);

module.exports.scopes = isA.array().items(scope).default([]).optional();

module.exports.newsletters = isA
  .array()
  .items(
    isA
      .string()
      .valid(
        'firefox-accounts-journey',
        'knowledge-is-power',
        'mozilla-foundation',
        'take-action-for-the-internet',
        'test-pilot',
        'mozilla-and-you',
        'security-privacy-news',
        'mozilla-accounts',
        'hubs',
        'mdnplus'
      )
  )
  .default([])
  .optional();

module.exports.thirdPartyProvider = isA
  .string()
  .max(256)
  .allow('google', 'apple')
  .required();

module.exports.thirdPartyIdToken = module.exports.jwt.optional();
module.exports.thirdPartyOAuthCode = isA.string().optional();

module.exports.entrypoint = isA.string()
  .regex(/^[a-zA-Z0-9_.-]+$/) // Only allow letters, digits, underscores, dots, and dashes
  .max(256)
  .required();
