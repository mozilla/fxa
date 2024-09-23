/* eslint-disable no-useless-escape,no-control-regex */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { URL } from 'url';
import punycode from 'punycode.js';
import isA from 'joi';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import { minimalConfigSchema } from 'fxa-shared/subscriptions/configuration/base';
import { productConfigJoiKeys } from 'fxa-shared/subscriptions/configuration/product';
import { planConfigJoiKeys } from 'fxa-shared/subscriptions/configuration/plan';
import { appStoreSubscriptionSchema, playStoreSubscriptionSchema } from 'fxa-shared/dto/auth/payments/iap-subscription';
import { latestInvoiceItemsSchema } from 'fxa-shared/dto/auth/payments/invoice';
import { default as DESCRIPTIONS } from '../../docs/swagger/shared/descriptions';
import { subscriptionProductMetadataBaseValidator, capabilitiesClientIdPattern } from 'fxa-shared/subscriptions/validation';
import { VX_REGEX as CLIENT_SALT_STRING } from '../../lib/routes/utils/client-key-stretch';
import { ReasonForDeletion } from './cloud-tasks';

// Match any non-empty hex-encoded string.
const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;
export { HEX_STRING };
export const BASE_36 = /^[a-zA-Z0-9]*$/;
export const BASE_10 = /^[0-9]*$/;

// RFC 4648, section 5
export const URL_SAFE_BASE_64 = /^[A-Za-z0-9_-]+$/;

// RFC 7636, section 4.1
export const PKCE_CODE_VERIFIER = /^[A-Za-z0-9-\._~]{43,128}$/;

// Crude phone number validation. The handler code does it more thoroughly.
export const E164_NUMBER = /^\+[1-9]\d{1,14}$/;

export const DIGITS = /^[0-9]+$/;
export const DEVICE_COMMAND_NAME = /^[a-zA-Z0-9._\/\-:]{1,100}$/;
export const IP_ADDRESS = isA.string().ip();

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
export { DISPLAY_SAFE_UNICODE };

// Similar display-safe match but includes non-BMP characters
const DISPLAY_SAFE_UNICODE_WITH_NON_BMP =
  /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uE000-\uF8FF\uFFF9-\uFFFC\uFFFE-\uFFFF])*$/;
export { DISPLAY_SAFE_UNICODE_WITH_NON_BMP };

// Bearer auth header regex
const BEARER_AUTH_REGEX = /^Bearer\s+([a-z0-9+\/]+)$/i;
export { BEARER_AUTH_REGEX };

// Joi validator to match any valid email address.
// This is different to Joi's builtin email validator, and
// requires a custom validation function.

export const email = function () {
  const email = isA
    .string()
    .max(255)
    .regex(DISPLAY_SAFE_UNICODE)
    .custom((value) => {
      // Do custom validation
      const isValid = isValidEmailAddress(value);

      if (!isValid) {
        throw new Error('Not a valid email address');
      }
      return value;
    });

  return email;
};

export const service = isA
  .string()
  .max(16)
  .regex(/^[a-zA-Z0-9\-]*$/);

export const hexString = isA.string().regex(HEX_STRING);
export const uid = hexString.length(32);
export const clientId = hexString.length(16);
export const clientSecret = hexString;

export const jwt = isA
  .string()
  .max(1024)
  // JWT format: 'header.payload.signature'
  .regex(/^([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)$/);

export const idToken = jwt;

export const reasonForAccountDeletion = isA
  .string()
  .valid(...Object.values(ReasonForDeletion));

export const refreshToken = hexString.length(64);
export const sessionToken = hexString.length(64);
export const sessionTokenId = hexString.length(64);
export const authorizationCode = hexString.length(64);
// Note that the empty string is a valid scope value (meaning "no permissions").
const scope = isA
  .string()
  .max(256)
  .regex(/^[a-zA-Z0-9 _\/.:-]*$/)
  .allow('');
export { scope };

export const assertion = isA
  .string()
  .min(50)
  .max(10240)
  .regex(/^[a-zA-Z0-9_\-\.~=]+$/);

export const pkceCodeChallengeMethod = isA.string().valid('S256');

export const pkceCodeChallenge = isA.string().length(43).regex(URL_SAFE_BASE_64);

export const pkceCodeVerifier = isA
  .string()
  .min(43)
  .max(128)
  .regex(PKCE_CODE_VERIFIER);

export const jwe = isA
  .string()
  .max(1024)
  // JWE token format: 'protectedheader.encryptedkey.iv.cyphertext.authenticationtag'
  .regex(
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
  );

export const accessToken = isA.alternatives().try(hexString.length(64), jwt);

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

export const isValidEmailAddress = function (value) {
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

export const redirectTo = function redirectTo(base) {
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

export const url = function url(options) {
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
export const resourceUrl = url().regex(/#/, { invert: true });

export const pushCallbackUrl = function pushUrl(options) {
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

export const verificationMethod = isA.string().valid(
  'email', // Verification by email link
  'email-otp', // Verification by email otp code using account long code (`emailCode`) as secret
  'email-2fa', // Verification by email code using randomly generated code (used in login flow)
  'email-captcha', // Verification by email code using randomly generated code (used in unblock flow)
  'totp-2fa' // Verification by TOTP authenticator device code, secret is randomly generated
);

export const authPW = isA.string().length(64).regex(HEX_STRING).required();
export const wrapKb = isA.string().length(64).regex(HEX_STRING);
export const authPWVersion2 = isA.string().length(64).regex(HEX_STRING);
export const clientSalt = isA.string().regex(CLIENT_SALT_STRING);
export const recoveryKeyId = isA.string().regex(HEX_STRING).max(32);

export const recoveryData = isA
  .string()
  .regex(/[a-zA-Z0-9.]/)
  .max(1024)
  .required();

export const recoveryKeyHint = isA
  .string()
  .max(255)
  .regex(DISPLAY_SAFE_UNICODE);

export const recoveryCode = function (len, base) {
  const regex = base || BASE_36;
  return isA.string().regex(regex).min(8).max(len);
};

export const recoveryCodes = function (codeCount, codeLen, base) {
  return isA.object({
    recoveryCodes: isA
      .array()
      .min(1)
      .max(codeCount)
      .unique()
      .items(recoveryCode(codeLen, base))
      .required(),
  });
};

export const stripePaymentMethodId = isA.string().max(30);
export const paypalPaymentToken = isA.string().max(30);
export const subscriptionsSubscriptionId = isA.string().max(255);
export const subscriptionsPlanId = isA.string().max(255);
export const subscriptionsProductId = isA.string().max(255);
export const subscriptionsProductName = isA.string().max(255);
export const subscriptionsPaymentToken = isA.string().max(255);

export const subscriptionPaymentCountryCode = isA
  .string()
  .length(2)
  .allow(null);

// This is fxa-auth-db-mysql's perspective on an active subscription
export const activeSubscriptionValidator = isA.object({
  uid: isA.string().required().description(DESCRIPTIONS.uid),
  subscriptionId: subscriptionsSubscriptionId
    .required()
    .description(DESCRIPTIONS.subscriptionId),
  productId: subscriptionsProductId
    .required()
    .description(DESCRIPTIONS.productId),
  createdAt: isA.number().required().description(DESCRIPTIONS.createdAt),
  cancelledAt: isA
    .alternatives(isA.number(), isA.any().allow(null))
    .description(DESCRIPTIONS.cancelledAt),
});

export const subscriptionsSetupIntent = isA
  .object({
    client_secret: isA
      .string()
      .required()
      .description(DESCRIPTIONS.clientSecret),
  })
  .unknown(true);

// This is a Stripe subscription object with latest_invoice.payment_intent expanded
export const subscriptionsSubscriptionExpandedValidator = isA
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

export const subscriptionsInvoicePIExpandedValidator = isA
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

export const subscriptionsSubscriptionValidator = isA.object({
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
  plan_id: subscriptionsPlanId.required().description(DESCRIPTIONS.planId),
  product_id: subscriptionsProductId
    .required()
    .description(DESCRIPTIONS.productId),
  product_name: isA.string().required().description(DESCRIPTIONS.productName),
  status: isA.string().required().description(DESCRIPTIONS.status),
  subscription_id: subscriptionsSubscriptionId
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
export const subscriptionsWebSubscriptionSupportValidator = isA
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
    subscription_id: subscriptionsSubscriptionId
      .required()
      .description(DESCRIPTIONS.subscriptionId),
  })
  .unknown(true);

export const subscriptionsPlaySubscriptionSupportValidator = isA
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

export const subscriptionsAppStoreSubscriptionSupportValidator = isA
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

export const subscriptionsSubscriptionSupportValidator = isA.object({
  [MozillaSubscriptionTypes.WEB]: isA
    .array()
    .items(subscriptionsWebSubscriptionSupportValidator),
  [MozillaSubscriptionTypes.IAP_GOOGLE]: isA
    .array()
    .items(subscriptionsPlaySubscriptionSupportValidator),
  [MozillaSubscriptionTypes.IAP_APPLE]: isA
    .array()
    .items(subscriptionsAppStoreSubscriptionSupportValidator),
});

export const subscriptionsSubscriptionListValidator = isA.object({
  subscriptions: isA.array().items(subscriptionsSubscriptionValidator),
});

// https://mana.mozilla.org/wiki/pages/viewpage.action?spaceKey=COPS&title=SP+Tiered+Product+Support#SPTieredProductSupport-MetadataAgreements
// Trying to be a bit flexible in validation here:
// - subhub may not yet be including product / plan metadata in responses
// - metadata can contain arbitrary keys that we don't expect (e.g. used by other systems)
// - but we can make a good effort at validating what we expect to see when we see it
export const subscriptionPlanMetadataValidator = isA.object().unknown(true);

export const subscriptionProductMetadataValidator = {
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

export const subscriptionsPlanWithMetaDataValidator = isA.object({
  plan_id: subscriptionsPlanId.required().description(DESCRIPTIONS.planId),
  plan_metadata: subscriptionPlanMetadataValidator
    .optional()
    .description(DESCRIPTIONS.planMetadata),
  product_id: subscriptionsProductId
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

export const subscriptionsPlanWithProductConfigValidator = isA.object({
  plan_id: subscriptionsPlanId.required().description(DESCRIPTIONS.planId),
  plan_metadata: isA.object().optional().description(DESCRIPTIONS.planMetadata),
  product_id: subscriptionsProductId
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

export const customerId = isA
  .string()
  .optional()
  .description(DESCRIPTIONS.customerId);

export const subscriptionsCustomerValidator = isA.object({
  customerId: customerId,
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
    .items(subscriptionsSubscriptionValidator)
    .optional()
    .description(DESCRIPTIONS.subscriptions),
});

export const subscriptionsStripeIntentValidator = isA
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

export const subscriptionsStripeSourceValidator = isA
  .object({
    id: isA.string().required(),
    object: isA.string().required(),
    brand: isA.string().optional().description(DESCRIPTIONS.brand),
    exp_month: isA.string().optional().description(DESCRIPTIONS.expMonth),
    exp_year: isA.string().optional().description(DESCRIPTIONS.expYear),
    last4: isA.string().optional().description(DESCRIPTIONS.last4),
  })
  .unknown(true);

export const subscriptionsStripeInvoiceValidator = isA
  .object({
    id: isA.string().required(),
    payment_intent: isA
      .alternatives(
        isA.string().allow(null),
        subscriptionsStripeIntentValidator
      )
      .optional(),
  })
  .unknown(true);

export const subscriptionsStripePriceValidator = isA
  .object({
    id: isA.string().required(),
  })
  .unknown(true);

export const subscriptionsStripeSubscriptionItemValidator = isA
  .object({
    id: isA.string().required(),
    created: isA.number().required(),
    price: subscriptionsStripePriceValidator.required(),
  })
  .unknown(true);

export const subscriptionsStripeSubscriptionValidator = isA
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
          .items(subscriptionsStripeSubscriptionItemValidator)
          .required(),
      })
      .unknown(true)
      .optional(),
    latest_invoice: isA
      .alternatives(isA.string(), subscriptionsStripeInvoiceValidator)
      .optional(),
    status: isA.string().required().description(DESCRIPTIONS.status),
  })
  .unknown(true);

export { playStoreSubscriptionSchema as subscriptionsGooglePlaySubscriptionValidator };
export { appStoreSubscriptionSchema as subscriptionsAppStoreSubscriptionValidator };

export const subscriptionsStripeCustomerValidator = isA
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
          .items(subscriptionsStripeSubscriptionValidator)
          .required(),
      })
      .unknown(true)
      .optional(),
  })
  .unknown(true);

export const subscriptionsMozillaSubscriptionsValidator = isA
  .object({
    customerId: customerId,
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
        subscriptionsSubscriptionValidator,
        playStoreSubscriptionSchema,
        appStoreSubscriptionSchema
      )
      .required()
      .description(DESCRIPTIONS.subscriptions),
  })
  .unknown(true);

export const ppidSeed = isA.number().integer().min(0).max(1024);
export const scopes = isA.array().items(scope).default([]).optional();

export const newsletters = isA
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

export const thirdPartyProvider = isA
  .string()
  .max(256)
  .allow('google', 'apple')
  .required();

export const thirdPartyIdToken = jwt.optional();
export const thirdPartyOAuthCode = isA.string().optional();
