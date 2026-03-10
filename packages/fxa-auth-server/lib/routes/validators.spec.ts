/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/validators.js (Mocha → Jest).
 */

const validators = require('./validators');
const plan1 = require('../../test/local/payments/fixtures/stripe/plan1.json');
const validProductMetadata = plan1.product.metadata;
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const { deepCopy } = require('../../test/local/payments/util');
const { ReasonForDeletion } = require('@fxa/shared/cloud-tasks');

describe('lib/routes/validators:', () => {
  it('isValidEmailAddress returns true for valid email addresses', () => {
    expect(validators.isValidEmailAddress('foo@example.com')).toBe(true);
    expect(validators.isValidEmailAddress('FOO@example.com')).toBe(true);
    expect(validators.isValidEmailAddress('42@example.com')).toBe(true);
    expect(
      validators.isValidEmailAddress('.+#$!%&|*/+-=?^_{}~`@example.com')
    ).toBe(true);
    expect(validators.isValidEmailAddress('Δ٢@example.com')).toBe(true);
    expect(validators.isValidEmailAddress('🦀🧙@example.com')).toBe(true);
    expect(
      validators.isValidEmailAddress(
        `${new Array(64).fill('a').join('')}@example.com`
      )
    ).toBe(true);
    expect(validators.isValidEmailAddress('foo@EXAMPLE.com')).toBe(true);
    expect(validators.isValidEmailAddress('foo@42.com')).toBe(true);
    expect(validators.isValidEmailAddress('foo@ex-ample.com')).toBe(true);
    expect(validators.isValidEmailAddress('foo@Δ٢.com')).toBe(true);
    expect(validators.isValidEmailAddress('foo@ex🦀ample.com')).toBe(true);
    expect(
      validators.isValidEmailAddress(
        `foo@${new Array(251).fill('a').join('')}.com`
      )
    ).toBe(true);
  });

  it('isValidEmailAddress returns false for undefined', () => {
    expect(validators.isValidEmailAddress()).toBe(false);
  });

  it('isValidEmailAddress returns false if the string has no @', () => {
    expect(validators.isValidEmailAddress('fooexample.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the string begins with @', () => {
    expect(validators.isValidEmailAddress('@example.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the string ends with @', () => {
    expect(validators.isValidEmailAddress('foo@')).toBe(false);
  });

  it('isValidEmailAddress returns false if the string contains multiple @', () => {
    expect(validators.isValidEmailAddress('foo@foo@example.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the user part contains whitespace', () => {
    expect(validators.isValidEmailAddress('foo @example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo\x160@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo\t@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo\v@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo\r@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo\n@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo\f@example.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the user part contains other control characters', () => {
    expect(validators.isValidEmailAddress('foo\0@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo\b@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo\x128@example.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the user part contains other disallowed characters', () => {
    expect(validators.isValidEmailAddress('foo,@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo;@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo:@example.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo"@example.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the user part exceeds 64 characters', () => {
    expect(
      validators.isValidEmailAddress(
        `${new Array(65).fill('a').join('')}@example.com`
      )
    ).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part does not have a period', () => {
    expect(validators.isValidEmailAddress('foo@example')).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part ends with a period', () => {
    expect(validators.isValidEmailAddress('foo@example.com.')).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part ends with a hyphen', () => {
    expect(validators.isValidEmailAddress('foo@example.com-')).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part follows a period with a hyphen', () => {
    expect(validators.isValidEmailAddress('foo@example.-com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part follows a hyphen with a period', () => {
    expect(validators.isValidEmailAddress('foo@example-.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part contains whitespace', () => {
    expect(validators.isValidEmailAddress('foo@ex ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex\x160ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex\tample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex\vample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex\rample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex\nample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex\fample.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part contains other control characters', () => {
    expect(validators.isValidEmailAddress('foo@ex\0ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@e\bxample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex\x128ample.com')).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part contains other disallowed characters', () => {
    expect(validators.isValidEmailAddress('foo@ex+ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex_ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex#ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex$ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex!ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex~ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex,ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex;ample.com')).toBe(false);
    expect(validators.isValidEmailAddress('foo@ex:ample.com')).toBe(false);
    expect(validators.isValidEmailAddress("foo@ex'ample.com")).toBe(false);
  });

  it('isValidEmailAddress returns false if the domain part exceeds 255 characters', () => {
    expect(
      validators.isValidEmailAddress(
        `foo@${new Array(252).fill('a').join('')}.com`
      )
    ).toBe(false);
  });

  describe('validators.redirectTo without base hostname:', () => {
    const v = validators.redirectTo();

    it('accepts a well-formed https:// URL', () => {
      const res = v.validate('https://example.com/path');
      expect(res.error).toBeFalsy();
      expect(res.value).toBe('https://example.com/path');
    });

    it('accepts a well-formed http:// URL', () => {
      const res = v.validate('http://example.com/path');
      expect(res.error).toBeFalsy();
      expect(res.value).toBe('http://example.com/path');
    });

    it('rejects a non-URL string', () => {
      const res = v.validate('not a url');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('not a url');
    });

    it('rejects a non-http(s) URL', () => {
      const res = v.validate('mailto:test@example.com');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('mailto:test@example.com');
    });

    it('rejects tricksy quoted chars in the hostname', () => {
      const res = v.validate('https://example.com%2Eevil.com');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('https://example.com%2Eevil.com');
    });
  });

  describe('validators.redirectTo with a base hostname:', () => {
    const v = validators.redirectTo('mozilla.com');

    it('accepts a well-formed https:// URL at the base hostname', () => {
      const res = v.validate('https://test.mozilla.com/path');
      expect(res.error).toBeFalsy();
      expect(res.value).toBe('https://test.mozilla.com/path');
    });

    it('accepts a well-formed http:// URL at the base hostname', () => {
      const res = v.validate('http://test.mozilla.com/path');
      expect(res.error).toBeFalsy();
      expect(res.value).toBe('http://test.mozilla.com/path');
    });

    it('rejects a non-URL string', () => {
      const res = v.validate('not a url');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('not a url');
    });

    it('rejects a non-http(s) URL at the base hostname', () => {
      const res = v.validate('irc://irc.mozilla.com/#fxa');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('irc://irc.mozilla.com/#fxa');
    });

    it('rejects a well-formed https:// URL at a different hostname', () => {
      const res = v.validate('https://test.example.com/path');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('https://test.example.com/path');
    });

    it('accepts a well-formed http:// URL at a different hostname', () => {
      const res = v.validate('http://test.example.com/path');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('http://test.example.com/path');
    });

    it('rejects tricksy quoted chars in the hostname', () => {
      let res = v.validate('https://evil.com%2Emozilla.com');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('https://evil.com%2Emozilla.com');

      res = v.validate('https://mozilla.com%2Eevil.com');
      expect(res.error).toBeTruthy();
      expect(res.value).toBe('https://mozilla.com%2Eevil.com');
    });

    it('rejects if over 2048 characters', () => {
      const res = v.validate(
        `https://example.com/${new Array(2048).fill('a').join('')}`
      );
      expect(res.error).toBeTruthy();
    });
  });

  describe('subscriptionPlanMetadataValidator', () => {
    const { subscriptionPlanMetadataValidator: subject } = validators;

    it('accepts an empty object', () => {
      const res = subject.validate({});
      expect(res.error).toBeFalsy();
    });

    it('does not accept a non-object', () => {
      const res = subject.validate(123);
      expect(res.error).toBeTruthy();
    });
  });

  describe('subscriptionProductMetadataValidator', () => {
    const { subscriptionProductMetadataValidator: subject } = validators;

    const deletePropAndValidate = (prop: string) => {
      const copiedProductMetadata = Object.assign({}, validProductMetadata);
      delete copiedProductMetadata[prop];
      return subject.validate(copiedProductMetadata);
    };

    const validateKeyValuePairAndReturn = (key: string, value: any) => {
      const obj: Record<string, any> = {};
      obj[key] = value;
      return subject.validate(Object.assign({}, validProductMetadata, obj));
    };

    it('rejects an empty object', () => {
      const res = subject.validate({});
      expect(res.error).toBeTruthy();
    });

    it('rejects a non-object', () => {
      const res = subject.validate(123);
      expect(res.error).toBeTruthy();
    });

    it('accepts unexpected keys', () => {
      const res = subject.validate(
        Object.assign({}, validProductMetadata, {
          newThing: 'this is unexpected',
        })
      );
      expect(res.error).toBeFalsy();
    });

    it('rejects expected keys with invalid values', () => {
      let res;
      res = validateKeyValuePairAndReturn('webIconURL', true);
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('upgradeCTA', true);
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('successActionButtonURL', true);
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('successActionButtonURL', 'nota.url');
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('appStoreLink', true);
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('appStoreLink', 'nota.url');
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('playStoreLink', true);
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('playStoreLink', 'nota.url');
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('productSet', true);
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('productOrder', true);
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn(
        'product:termsOfServiceDownloadURL',
        'https://not.the.legal.url.com/blah'
      );
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn(
        'product:termsOfServiceURL',
        'nota.url'
      );
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn(
        'product:privacyNoticeDownloadURL',
        'https://not.the.legal.url.com/blah'
      );
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn(
        'product:privacyNoticeURL',
        'nota.url'
      );
      expect(res.error).toBeTruthy();

      res = validateKeyValuePairAndReturn('capabilities:blahblah', true);
      expect(res.error).toBeTruthy();
    });

    it('rejects if missing required props', () => {
      let res = deletePropAndValidate('successActionButtonURL');
      expect(res.error).toBeTruthy();

      res = deletePropAndValidate('product:privacyNoticeURL');
      expect(res.error).toBeTruthy();

      res = deletePropAndValidate('product:termsOfServiceURL');
      expect(res.error).toBeTruthy();

      res = deletePropAndValidate('product:termsOfServiceDownloadURL');
      expect(res.error).toBeTruthy();

      res = deletePropAndValidate('capabilities:aFakeClientId12345');
      expect(res.error).toBeTruthy();
    });
  });

  describe('subscriptionsPlanWithMetaDataValidator', () => {
    const { subscriptionsPlanWithMetaDataValidator: subject } = validators;

    const basePlan = {
      plan_id: 'plan_8675309',
      plan_name: '',
      product_id: 'prod_8675309',
      product_name: 'example product',
      interval: 'month',
      interval_count: 1,
      amount: '867',
      currency: 'usd',
      active: true,
    };

    it('accepts missing plan and product metadata', () => {
      const plan = { ...basePlan };
      const res = subject.validate(plan);
      expect(res.error).toBeFalsy();
    });

    it('accepts valid plan and product metadata', () => {
      const plan = {
        ...basePlan,
        plan_metadata: {},
        product_metadata: validProductMetadata,
      };
      const res = subject.validate(plan);
      expect(res.error).toBeFalsy();
    });

    it('rejects invalid product metadata', () => {
      const plan = {
        ...basePlan,
        product_metadata: Object.assign({}, validProductMetadata, {
          webIconURL: true,
        }),
      };
      const res = subject.validate(plan);
      expect(res.error).toBeTruthy();
    });
  });

  describe('subscriptionsPlanWithProductConfigValidator', () => {
    const { subscriptionsPlanWithProductConfigValidator: subject } = validators;

    const basePlanWithConfig = {
      plan_id: 'plan_8675309',
      plan_name: '',
      product_id: 'prod_8675309',
      product_name: 'example product',
      interval: 'month',
      interval_count: 1,
      amount: '867',
      currency: 'usd',
      active: true,
      configuration: {
        productSet: ['foo'],
        urls: {
          emailIcon: 'http://firestore.example.gg/email.ico',
          successActionButton: 'http://firestore.example.gg/download',
        },
      },
    };

    it('accepts missing plan and product metadata', () => {
      const plan = { ...basePlanWithConfig };
      const res = subject.validate(plan);
      expect(res.error).toBeFalsy();
    });

    it('rejects missing product configuration', () => {
      const plan = {
        ...basePlanWithConfig,
        configuration: undefined,
      };
      const res = subject.validate(plan);
      expect(res.error).toBeTruthy();
    });
  });

  describe('subscriptionsStripeSubscriptionValidator', () => {
    const { subscriptionsStripeSubscriptionValidator: subject } = validators;

    it('accepts an example of a real API response', () => {
      const data = {
        cancel_at_period_end: false,
        cancel_at: null,
        canceled_at: null,
        created: 1594252774,
        current_period_end: 1596931174,
        current_period_start: 1594252774,
        ended_at: null,
        id: 'sub_Hc1Db1g9PoNzbO',
        items: {
          object: 'list',
          data: [
            {
              id: 'si_Hc1DlRa7cZ8vKi',
              created: 1594252775,
              price: {
                id: 'plan_GqM9N6qyhvxaVk',
                active: true,
                currency: 'usd',
                metadata: {},
                nickname: '123Done Pro Monthly',
                product: 'prod_GqM9ToKK62qjkK',
                recurring: {
                  aggregate_usage: null,
                  interval: 'month',
                  interval_count: 1,
                  trial_period_days: null,
                  usage_type: 'licensed',
                },
                type: 'recurring',
                unit_amount: 500,
              },
            },
          ],
          has_more: false,
          total_count: 1,
          url: '/v1/subscription_items?subscription=sub_Hc1Db1g9PoNzbO',
        },
        latest_invoice: {
          id: 'in_1H2nApBVqmGyQTMaxm1us1tb',
          object: 'invoice',
          payment_intent: {
            client_secret:
              'pi_1H2nApBVqmGyQTMaAcsgHdKO_secret_TgEwGsXmcoUH9N8VKyZtOCJxz',
            created: 1594252775,
            next_action: {
              type: 'use_stripe_sdk',
              use_stripe_sdk: {
                type: 'three_d_secure_redirect',
                stripe_js:
                  'https://hooks.stripe.com/redirect/authenticate/src_1H2nApBVqmGyQTMa1G8pPh9n?client_secret=src_client_secret_0KDP3B9a31NxRRsvwLGm12FT',
                source: 'src_1H2nApBVqmGyQTMa1G8pPh9n',
                known_frame_issues: 'false',
              },
            },
            payment_method: 'pm_1H2nAmBVqmGyQTMaEyrNdTGF',
            status: 'requires_action',
          },
        },
        status: 'incomplete',
      };
      const res = subject.validate(data);
      expect(res.error).toBeFalsy();
    });
  });

  describe('subscriptionsGooglePlaySubscriptionValidator', () => {
    const mockGooglePlaySubscription = {
      auto_renewing: true,
      expiry_time_millis: Date.now(),
      package_name: 'org.mozilla.cooking.with.foxkeh',
      sku: 'org.mozilla.foxkeh.yearly',
      _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
      product_id: 'xyz',
      product_name: 'Awesome product',
      price_id: 'abc',
    };

    it('accepts a valid Google Play subscription', () => {
      const res =
        validators.subscriptionsGooglePlaySubscriptionValidator.validate(
          mockGooglePlaySubscription
        );
      expect(res.error).toBeFalsy();
    });

    it('rejects a Google Play subscription with the incorrect subscription type', () => {
      const unknownSubscription = deepCopy(mockGooglePlaySubscription);
      unknownSubscription._subscription_type = 'unknown';
      const res =
        validators.subscriptionsGooglePlaySubscriptionValidator.validate(
          unknownSubscription
        );
      expect(res.error).toBeTruthy();
    });

    it('rejects a Google Play subscription a missing product id', () => {
      const noProdIdSubscription = deepCopy(mockGooglePlaySubscription);
      delete noProdIdSubscription.product_id;
      const res =
        validators.subscriptionsGooglePlaySubscriptionValidator.validate(
          noProdIdSubscription
        );
      expect(res.error).toBeTruthy();
    });
  });

  describe('subscriptionsAppStoreSubscriptionValidator', () => {
    const mockAppStoreSubscription = {
      _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
      app_store_product_id: 'wow',
      auto_renewing: true,
      bundle_id: 'hmm',
      price_id: 'price_123',
      product_id: 'prod_123',
      product_name: 'Cooking with Foxkeh',
    };

    it('accepts a valid App Store subscription', () => {
      const res =
        validators.subscriptionsAppStoreSubscriptionValidator.validate(
          mockAppStoreSubscription
        );
      expect(res.error).toBeFalsy();
    });

    it('rejects an App Store subscription with the incorrect subscription type', () => {
      const unknownSubscription = deepCopy(mockAppStoreSubscription);
      unknownSubscription._subscription_type = 'unknown';
      const res =
        validators.subscriptionsAppStoreSubscriptionValidator.validate(
          unknownSubscription
        );
      expect(res.error).toBeTruthy();
    });

    it('rejects an App Store subscription a missing product id', () => {
      const noProdIdSubscription = deepCopy(mockAppStoreSubscription);
      delete noProdIdSubscription.product_id;
      const res =
        validators.subscriptionsAppStoreSubscriptionValidator.validate(
          noProdIdSubscription
        );
      expect(res.error).toBeTruthy();
    });
  });

  describe('subscriptionsStripeCustomerValidator', () => {
    const { subscriptionsStripeCustomerValidator: subject } = validators;

    it('accepts an example of a real API response', () => {
      const data = {
        id: 'cus_Hc0e7ojp2976b1',
        object: 'customer',
        address: null,
        balance: 0,
        created: 1594250683,
        currency: null,
        default_source: null,
        delinquent: false,
        description: 'fab69542c8ec48d9b9f0366a8f093208',
        discount: null,
        email: 'foo@example.com',
        invoice_prefix: '3ED99BDD',
        invoice_settings: {
          custom_fields: null,
          default_payment_method: null,
          footer: null,
        },
        livemode: false,
        metadata: { userid: 'fab69542c8ec48d9b9f0366a8f093208' },
        name: 'ytfytf',
        next_invoice_sequence: 1,
        phone: null,
        preferred_locales: [],
        shipping: null,
        sources: {
          object: 'list',
          data: [],
          has_more: false,
          total_count: 0,
          url: '/v1/customers/cus_Hc0e7ojp2976b1/sources',
        },
        subscriptions: {
          object: 'list',
          data: [],
          has_more: false,
          total_count: 0,
          url: '/v1/customers/cus_Hc0e7ojp2976b1/subscriptions',
        },
        tax_exempt: 'none',
        tax_ids: {
          object: 'list',
          data: [],
          has_more: false,
          total_count: 0,
          url: '/v1/customers/cus_Hc0e7ojp2976b1/tax_ids',
        },
      };
      const res = subject.validate(data);
      expect(res.error).toBeFalsy();
    });
  });

  describe('subscriptionsMozillaSubscriptionsValidator', () => {
    const stripeSub = {
      _subscription_type: MozillaSubscriptionTypes.WEB,
      cancel_at_period_end: false,
      created: 1573695337,
      current_period_end: 1576287337,
      current_period_start: 1573695337,
      end_at: null,
      latest_invoice: 'in_1FeXFGJNcmPzuWtR3EUd2zw7',
      latest_invoice_items: {
        line_items: [
          {
            amount: 599,
            currency: 'usd',
            id: 'plan_G93lTs8hfK7NNG',
            name: 'testo',
            period: {
              end: 1576287337,
              start: 1576287337,
            },
          },
        ],
        subtotal: 599,
        subtotal_excluding_tax: null,
        total: 599,
        total_excluding_tax: null,
      },
      plan_id: 'plan_G93lTs8hfK7NNG',
      product_id: 'prod_G93l8Yn7XJHYUs',
      product_name: 'testo',
      promotion_code: 'testo',
      status: 'active',
      subscription_id: 'sub_xyz',
    };
    const playSub = {
      _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
      price_id: 'abc',
      product_id: 'xyz',
      product_name: 'Awesome product',
      auto_renewing: true,
      expiry_time_millis: Date.now(),
      package_name: 'org.mozilla.cooking.with.foxkeh',
      sku: 'org.mozilla.foxkeh.yearly',
    };
    const appSub = {
      _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
      app_store_product_id: 'wow',
      auto_renewing: true,
      bundle_id: 'hmm',
      expiry_time_millis: 1591650790000,
      price_id: 'price_123',
      product_id: 'prod_123',
      product_name: 'Cooking with Foxkeh',
    };

    it('accepts a list with Stripe, Google Play and App Store subscriptions', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [stripeSub, playSub, appSub],
        });
      expect(res.error).toBeFalsy();
    });

    it('accepts a list with only Stripe subscriptions', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [stripeSub, stripeSub],
        });
      expect(res.error).toBeFalsy();
    });

    it('accepts a Stripe subscription with missing or undefined optional parameters', () => {
      const stripeSubMissing = deepCopy(stripeSub);
      const stripeSubUndefined = deepCopy(stripeSub);
      delete stripeSubMissing.latest_invoice_items.subtotal_excluding_tax;
      stripeSubUndefined.latest_invoice_items.subtotal_excluding_tax =
        undefined;

      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [stripeSubMissing, stripeSubUndefined],
        });
      expect(res.error).toBeFalsy();
    });

    it('accepts a list with only Google Play subscriptions', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [playSub, playSub],
        });
      expect(res.error).toBeFalsy();
    });

    it('accepts a list with only App Store subscriptions', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [appSub, appSub],
        });
      expect(res.error).toBeFalsy();
    });

    it('allows an empty subscriptions list', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [],
        });
      expect(res.error).toBeFalsy();
    });

    it('rejects when the subscriptions property is missing', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({});
      expect(res.error).toBeTruthy();
    });
  });

  describe('support-panel subscriptions', () => {
    const webSub = {
      created: 1636489882,
      current_period_end: 1639081882,
      current_period_start: 1636489882,
      plan_changed: null,
      previous_product: null,
      product_name: 'Cooking with Foxkeh',
      status: 'active',
      subscription_id: 'sub_1Ju0yUBVqmGyQTMaG1mtTbdZ',
    };
    const playSub = {
      _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
      auto_renewing: false,
      expiry_time_millis: 1591650790000,
      package_name: 'club.foxkeh',
      sku: 'LOL.daily',
      price_id: 'price_testo',
      product_id: 'prod_testo',
      product_name: 'LOL Daily',
    };
    const appSub = {
      _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
      app_store_product_id: 'wow',
      auto_renewing: true,
      bundle_id: 'hmm',
      expiry_time_millis: 1591650790000,
      price_id: 'price_123',
      product_id: 'prod_123',
      product_name: 'Cooking with Foxkeh',
    };

    describe('subscriptionsWebSubscriptionSupportValidator', () => {
      const required = [
        'created',
        'current_period_end',
        'current_period_start',
        'product_name',
        'status',
        'subscription_id',
      ];

      it('accepts a valid web subscription for the support-panel', () => {
        const res =
          validators.subscriptionsWebSubscriptionSupportValidator.validate(
            webSub
          );
        expect(res.error).toBeFalsy();
      });

      for (const x of required) {
        it(`rejects when the required property ${x} is not present`, () => {
          const s = { ...webSub, [x]: undefined };
          const res =
            validators.subscriptionsWebSubscriptionSupportValidator.validate(s);
          expect(res.error).toBeTruthy();
        });
      }

      it('accepts a valid web subscription with unknown properties for the support-panel', () => {
        const webSubWithExtraProp = {
          ...webSub,
          otherId: 1234,
        };
        const res =
          validators.subscriptionsWebSubscriptionSupportValidator.validate(
            webSubWithExtraProp
          );
        expect(res.error).toBeFalsy();
      });
    });

    describe('subscriptionsPlaySubscriptionSupportValidator', () => {
      const required = ['auto_renewing', 'expiry_time_millis', 'product_name'];

      it('accepts a valid Play subscription for the support-panel', () => {
        const res =
          validators.subscriptionsPlaySubscriptionSupportValidator.validate(
            playSub
          );
        expect(res.error).toBeFalsy();
      });

      for (const x of required) {
        it(`rejects when the required property ${x} is not present`, () => {
          const s = { ...playSub, [x]: undefined };
          const res =
            validators.subscriptionsWebSubscriptionSupportValidator.validate(s);
          expect(res.error).toBeTruthy();
        });
      }

      it('accepts a valid play subscription with unknown properties for the support-panel', () => {
        const playSubWithExtraProp = {
          ...playSub,
          otherId: 1234,
        };
        const res =
          validators.subscriptionsPlaySubscriptionSupportValidator.validate(
            playSubWithExtraProp
          );
        expect(res.error).toBeFalsy();
      });
    });

    describe('subscriptionsAppStoreSubscriptionSupportValidator', () => {
      const required = [
        'app_store_product_id',
        'auto_renewing',
        'bundle_id',
        'product_name',
      ];

      it('accepts a valid App Store subscription for the support-panel', () => {
        const res =
          validators.subscriptionsAppStoreSubscriptionSupportValidator.validate(
            appSub
          );
        expect(res.error).toBeFalsy();
      });

      for (const x of required) {
        it(`rejects when the required property ${x} is not present`, () => {
          const s = { ...appSub, [x]: undefined };
          const res =
            validators.subscriptionsWebSubscriptionSupportValidator.validate(s);
          expect(res.error).toBeTruthy();
        });
      }

      it('accepts a valid App Store subscription with unknown properties for the support-panel', () => {
        const appSubWithExtraProp = {
          ...appSub,
          otherId: 1234,
        };
        const res =
          validators.subscriptionsAppStoreSubscriptionSupportValidator.validate(
            appSubWithExtraProp
          );
        expect(res.error).toBeFalsy();
      });
    });

    describe('subscriptionsSubscriptionSupportValidator', () => {
      it('accepts a valid response object', () => {
        const subs = {
          [MozillaSubscriptionTypes.WEB]: [webSub],
          [MozillaSubscriptionTypes.IAP_GOOGLE]: [playSub],
          [MozillaSubscriptionTypes.IAP_APPLE]: [appSub],
        };
        const res =
          validators.subscriptionsSubscriptionSupportValidator.validate(subs);
        expect(res.error).toBeFalsy();
      });

      it('accepts empty arrays', () => {
        const subs = {
          [MozillaSubscriptionTypes.WEB]: [],
          [MozillaSubscriptionTypes.IAP_GOOGLE]: [],
          [MozillaSubscriptionTypes.IAP_APPLE]: [],
        };
        const res =
          validators.subscriptionsSubscriptionSupportValidator.validate(subs);
        expect(res.error).toBeFalsy();
      });
    });
  });

  describe('backup authentication codes', () => {
    it('allows base32 codes', () => {
      expect(
        validators
          .recoveryCodes(2, 10)
          .validate({ recoveryCodes: ['123456789A', '123456789B'] }).error
      ).toBeFalsy();
    });

    it('allows base36 codes', () => {
      expect(
        validators
          .recoveryCodes(1, 10)
          .validate({ recoveryCodes: ['012345678L'] }).error
      ).toBeFalsy();
    });

    it('detects missing backup authentication codes', () => {
      expect(
        validators.recoveryCodes(2, 10).validate({ recoveryCodes: [] }).error
      ).toBeTruthy();
      expect(
        validators.recoveryCodes(2, 10).validate({}).error
      ).toBeTruthy();
    });

    it('detects improper count', () => {
      expect(
        validators.recoveryCodes(2, 10).validate({
          recoveryCodes: ['123456789A', '123456789B', '123456789C'],
        }).error
      ).toBeTruthy();
    });

    it('detects duplicates', () => {
      expect(
        validators
          .recoveryCodes(2, 10)
          .validate({ recoveryCodes: ['1234567890', '1234567890'] }).error
      ).toBeTruthy();
    });

    it('detects allows less than maximum', () => {
      expect(
        validators
          .recoveryCodes(2, 10)
          .validate({ recoveryCodes: ['123456789', '123456789'] }).error
      ).toBeTruthy();
    });

    it('detects minimum', () => {
      expect(
        validators.recoveryCodes(2, 10).validate({ recoveryCodes: ['', ''] })
          .error
      ).toBeTruthy();
    });
  });

  describe('backup authentication code', () => {
    it('validates backup authentication codes', () => {
      expect(
        validators.recoveryCode(10).validate('0123456789').error
      ).toBeFalsy();
    });

    it('invalidates backup authentication code', () => {
      expect(
        validators.recoveryCode(10).validate('012345678-').error
      ).toBeTruthy();
    });

    it('requires proper length', () => {
      expect(
        validators.recoveryCode(5).validate('1234').error
      ).toBeTruthy();
      expect(
        validators.recoveryCode(11).validate('123456').error
      ).toBeTruthy();
    });
  });

  describe('reason for account deletion', () => {
    it('validates valid reason', () => {
      expect(
        validators.reasonForAccountDeletion.validate(ReasonForDeletion.Cleanup)
          .error
      ).toBeFalsy();
      expect(
        validators.reasonForAccountDeletion.validate(
          ReasonForDeletion.UserRequested
        ).error
      ).toBeFalsy();
      expect(
        validators.reasonForAccountDeletion.validate(
          ReasonForDeletion.Unverified
        ).error
      ).toBeFalsy();
      expect(
        validators.reasonForAccountDeletion.validate(ReasonForDeletion.Cleanup)
          .error
      ).toBeFalsy();
      expect(
        validators.reasonForAccountDeletion.validate(
          ReasonForDeletion.InactiveAccountScheduled
        ).error
      ).toBeFalsy();
      expect(
        validators.reasonForAccountDeletion.validate(
          ReasonForDeletion.InactiveAccountEmailBounced
        ).error
      ).toBeFalsy();
      expect(
        validators.reasonForAccountDeletion.validate(
          ReasonForDeletion.AdminRequested
        ).error
      ).toBeFalsy();
    });

    it('requires valid reason', () => {
      expect(
        validators.reasonForAccountDeletion.validate('blah').error
      ).toBeTruthy();
    });
  });
});
