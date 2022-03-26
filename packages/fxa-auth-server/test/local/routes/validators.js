/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const validators = require('../../../lib/routes/validators');
const plan1 = require('../payments/fixtures/stripe/plan1.json');
const validProductMetadata = plan1.product.metadata;
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');

describe('lib/routes/validators:', () => {
  it('isValidEmailAddress returns true for valid email addresses', () => {
    assert.strictEqual(validators.isValidEmailAddress('foo@example.com'), true);
    assert.strictEqual(validators.isValidEmailAddress('FOO@example.com'), true);
    assert.strictEqual(validators.isValidEmailAddress('42@example.com'), true);
    assert.strictEqual(
      validators.isValidEmailAddress('.+#$!%&|*/+-=?^_{}~`@example.com'),
      true
    );
    assert.strictEqual(validators.isValidEmailAddress('Δ٢@example.com'), true);
    assert.strictEqual(
      validators.isValidEmailAddress('🦀🧙@example.com'),
      true
    );
    assert.strictEqual(
      validators.isValidEmailAddress(
        `${new Array(64).fill('a').join('')}@example.com`
      ),
      true
    );
    assert.strictEqual(validators.isValidEmailAddress('foo@EXAMPLE.com'), true);
    assert.strictEqual(validators.isValidEmailAddress('foo@42.com'), true);
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex-ample.com'),
      true
    );
    assert.strictEqual(validators.isValidEmailAddress('foo@Δ٢.com'), true);
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex🦀ample.com'),
      true
    );
    assert.strictEqual(
      validators.isValidEmailAddress(
        `foo@${new Array(251).fill('a').join('')}.com`
      ),
      true
    );
  });

  it('isValidEmailAddress returns false for undefined', () => {
    assert.strictEqual(validators.isValidEmailAddress(), false);
  });

  it('isValidEmailAddress returns false if the string has no @', () => {
    assert.strictEqual(validators.isValidEmailAddress('fooexample.com'), false);
  });

  it('isValidEmailAddress returns false if the string begins with @', () => {
    assert.strictEqual(validators.isValidEmailAddress('@example.com'), false);
  });

  it('isValidEmailAddress returns false if the string ends with @', () => {
    assert.strictEqual(validators.isValidEmailAddress('foo@'), false);
  });

  it('isValidEmailAddress returns false if the string contains multiple @', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo@foo@example.com'),
      false
    );
  });

  it('isValidEmailAddress returns false if the user part contains whitespace', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo @example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo\x160@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo\t@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo\v@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo\r@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo\n@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo\f@example.com'),
      false
    );
  });

  it('isValidEmailAddress returns false if the user part contains other control characters', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo\0@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo\b@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo\x128@example.com'),
      false
    );
  });

  it('isValidEmailAddress returns false if the user part contains other disallowed characters', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo,@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo;@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo:@example.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo"@example.com'),
      false
    );
  });

  it('isValidEmailAddress returns false if the user part exceeds 64 characters', () => {
    assert.strictEqual(
      validators.isValidEmailAddress(
        `${new Array(65).fill('a').join('')}@example.com`
      ),
      false
    );
  });

  it('isValidEmailAddress returns false if the domain part does not have a period', () => {
    assert.strictEqual(validators.isValidEmailAddress('foo@example'), false);
  });

  it('isValidEmailAddress returns false if the domain part ends with a period', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo@example.com.'),
      false
    );
  });

  it('isValidEmailAddress returns false if the domain part ends with a hyphen', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo@example.com-'),
      false
    );
  });

  it('isValidEmailAddress returns false if the domain part follows a period with a hyphen', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo@example.-com'),
      false
    );
  });

  it('isValidEmailAddress returns false if the domain part follows a hyphen with a period', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo@example-.com'),
      false
    );
  });

  it('isValidEmailAddress returns false if the domain part contains whitespace', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex\x160ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex\tample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex\vample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex\rample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex\nample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex\fample.com'),
      false
    );
  });

  it('isValidEmailAddress returns false if the domain part contains other control characters', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex\0ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@e\bxample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex\x128ample.com'),
      false
    );
  });

  it('isValidEmailAddress returns false if the domain part contains other disallowed characters', () => {
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex+ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex_ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex#ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex$ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex!ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex~ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex,ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex;ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress('foo@ex:ample.com'),
      false
    );
    assert.strictEqual(
      validators.isValidEmailAddress("foo@ex'ample.com"),
      false
    );
  });

  it('isValidEmailAddress returns false if the domain part exceeds 255 characters', () => {
    assert.strictEqual(
      validators.isValidEmailAddress(
        `foo@${new Array(252).fill('a').join('')}.com`
      ),
      false
    );
  });

  describe('validators.redirectTo without base hostname:', () => {
    const v = validators.redirectTo();

    it('accepts a well-formed https:// URL', () => {
      const res = v.validate('https://example.com/path');
      assert.ok(!res.error);
      assert.equal(res.value, 'https://example.com/path');
    });

    it('accepts a well-formed http:// URL', () => {
      const res = v.validate('http://example.com/path');
      assert.ok(!res.error);
      assert.equal(res.value, 'http://example.com/path');
    });

    it('rejects a non-URL string', () => {
      const res = v.validate('not a url');
      assert.ok(res.error);
      assert.equal(res.value, 'not a url');
    });

    it('rejects a non-http(s) URL', () => {
      const res = v.validate('mailto:test@example.com');
      assert.ok(res.error);
      assert.equal(res.value, 'mailto:test@example.com');
    });

    it('rejects tricksy quoted chars in the hostname', () => {
      const res = v.validate('https://example.com%2Eevil.com');
      assert.ok(res.error);
      assert.equal(res.value, 'https://example.com%2Eevil.com');
    });
  });

  describe('validators.redirectTo with a base hostname:', () => {
    const v = validators.redirectTo('mozilla.com');

    it('accepts a well-formed https:// URL at the base hostname', () => {
      const res = v.validate('https://test.mozilla.com/path');
      console.log(res)
      assert.ok(!res.error);
      assert.equal(res.value, 'https://test.mozilla.com/path');
    });

    it('accepts a well-formed http:// URL at the base hostname', () => {
      const res = v.validate('http://test.mozilla.com/path');
      assert.ok(!res.error);
      assert.equal(res.value, 'http://test.mozilla.com/path');
    });

    it('rejects a non-URL string', () => {
      const res = v.validate('not a url');
      assert.ok(res.error);
      assert.equal(res.value, 'not a url');
    });

    it('rejects a non-http(s) URL at the base hostname', () => {
      const res = v.validate('irc://irc.mozilla.com/#fxa');
      assert.ok(res.error);
      assert.equal(res.value, 'irc://irc.mozilla.com/#fxa');
    });

    it('rejects a well-formed https:// URL at a different hostname', () => {
      const res = v.validate('https://test.example.com/path');
      assert.ok(res.error);
      assert.equal(res.value, 'https://test.example.com/path');
    });

    it('accepts a well-formed http:// URL at a different hostname', () => {
      const res = v.validate('http://test.example.com/path');
      assert.ok(res.error);
      assert.equal(res.value, 'http://test.example.com/path');
    });

    it('rejects tricksy quoted chars in the hostname', () => {
      let res = v.validate('https://evil.com%2Emozilla.com');
      assert.ok(res.error);
      assert.equal(res.value, 'https://evil.com%2Emozilla.com');

      res = v.validate('https://mozilla.com%2Eevil.com');
      assert.ok(res.error);
      assert.equal(res.value, 'https://mozilla.com%2Eevil.com');
    });
  });

  describe('subscriptionPlanMetadataValidator', () => {
    const { subscriptionPlanMetadataValidator: subject } = validators;

    it('accepts an empty object', () => {
      const res = subject.validate({});
      assert.ok(!res.error);
    });

    it('does not accept a non-object', () => {
      const res = subject.validate(123);
      assert.ok(res.error);
    });
  });

  describe('subscriptionProductMetadataValidator', () => {
    const { subscriptionProductMetadataValidator: subject } = validators;

    const deletePropAndValidate = (prop) => {
      const copiedProductMetadata = Object.assign({}, validProductMetadata);
      delete copiedProductMetadata[prop];
      return subject.validate(copiedProductMetadata);
    };

    const validateKeyValuePairAndReturn = (key, value) => {
      const obj = {};
      obj[key] = value;
      return subject.validate(Object.assign({}, validProductMetadata, obj));
    };

    it('rejects an empty object', () => {
      const res = subject.validate({});
      assert.ok(res.error);
    });

    it('rejects a non-object', () => {
      const res = subject.validate(123);
      assert.ok(res.error);
    });

    it('accepts unexpected keys', () => {
      const res = subject.validate(
        Object.assign({}, validProductMetadata, {
          newThing: 'this is unexpected',
        })
      );
      assert.ok(!res.error);
    });

    it('rejects expected keys with invalid values', () => {
      let res;
      res = validateKeyValuePairAndReturn('webIconURL', true);
      assert.ok(res.error, 'webIconURL');

      res = validateKeyValuePairAndReturn('upgradeCTA', true);
      assert.ok(res.error, 'upgradeCTA');

      res = validateKeyValuePairAndReturn('downloadURL', true);
      assert.ok(res.error, 'downloadUrl');

      res = validateKeyValuePairAndReturn('downloadURL', 'nota.url');
      assert.ok(res.error, 'downloadUrl invalid url');

      res = validateKeyValuePairAndReturn('appStoreLink', true);
      assert.ok(res.error, 'appStoreLink');

      res = validateKeyValuePairAndReturn('appStoreLink', 'nota.url');
      assert.ok(res.error, 'appStoreLink invalid url');

      res = validateKeyValuePairAndReturn('playStoreLink', true);
      assert.ok(res.error, 'playStoreLink');

      res = validateKeyValuePairAndReturn('playStoreLink', 'nota.url');
      assert.ok(res.error, 'playStoreLink invalid url');

      res = validateKeyValuePairAndReturn('productSet', true);
      assert.ok(res.error, 'productSet');

      res = validateKeyValuePairAndReturn('productOrder', true);
      assert.ok(res.error, 'productOrder');

      res = validateKeyValuePairAndReturn(
        'product:termsOfServiceDownloadURL',
        'https://not.the.legal.url.com/blah'
      );
      assert.ok(res.error, 'product:termsOfServiceDownloadURL');

      res = validateKeyValuePairAndReturn(
        'product:termsOfServiceURL',
        'nota.url'
      );
      assert.ok(res.error, 'product:termsOfServiceURL');

      res = validateKeyValuePairAndReturn(
        'product:privacyNoticeDownloadURL',
        'https://not.the.legal.url.com/blah'
      );
      assert.ok(res.error, 'product:privacyNoticeDownloadURL');

      res = validateKeyValuePairAndReturn(
        'product:privacyNoticeURL',
        'nota.url'
      );
      assert.ok(res.error, 'product:privacyNoticeURL');

      res = validateKeyValuePairAndReturn('capabilities:blahblah', true);
      assert.ok(res.error, 'capabilities:blahblah');
    });

    it('rejects if missing required props', () => {
      let res = deletePropAndValidate('downloadURL');
      assert.ok(res.error);

      res = deletePropAndValidate('product:privacyNoticeURL');
      assert.ok(res.error);

      res = deletePropAndValidate('product:termsOfServiceURL');
      assert.ok(res.error);

      res = deletePropAndValidate('product:termsOfServiceDownloadURL');
      assert.ok(res.error);

      res = deletePropAndValidate('capabilities:aFakeClientId12345');
      assert.ok(res.error);
    });
  });

  describe('subscriptionsPlanValidator', () => {
    const { subscriptionsPlanValidator: subject } = validators;

    const basePlan = {
      plan_id: 'plan_8675309',
      plan_name: '',
      product_id: 'prod_8675309',
      product_name: 'example product',
      interval: 'month',
      interval_count: 1,
      amount: '867',
      currency: 'usd',
    };

    it('accepts missing plan and product metadata', () => {
      const plan = { ...basePlan };
      const res = subject.validate(plan);
      assert.ok(!res.error);
    });

    it('accepts valid plan and product metadata', () => {
      const plan = {
        ...basePlan,
        plan_metadata: {},
        product_metadata: validProductMetadata,
      };
      const res = subject.validate(plan);
      assert.ok(!res.error);
    });

    it('rejects invalid product metadata', () => {
      const plan = {
        ...basePlan,
        product_metadata: Object.assign({}, validProductMetadata, {
          webIconURL: true,
        }),
      };
      const res = subject.validate(plan);
      assert.ok(res.error);
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
      assert.ok(!res.error);
    });
  });

  describe('subscriptionsGooglePlaySubscriptionValidator', () => {
    const mockAbbrevPlayPurchase = {
      auto_renewing: true,
      expiry_time_millis: Date.now(),
      package_name: 'org.mozilla.cooking.with.foxkeh',
      sku: 'org.mozilla.foxkeh.yearly',
    };
    it('accepts a valid Google Play subscription', () => {
      const res =
        validators.subscriptionsGooglePlaySubscriptionValidator.validate({
          _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
          product_id: 'xyz',
          product_name: 'Awesome product',
          price_id: 'abc',
          ...mockAbbrevPlayPurchase,
        });
      assert.ok(!res.error);
    });

    it('rejects a Google Play subscription with the incorrect subscription type', () => {
      const res =
        validators.subscriptionsGooglePlaySubscriptionValidator.validate({
          _subscription_type: 'unknown',
          product_id: 'xyz',
          price_id: 'abc',
          ...mockAbbrevPlayPurchase,
        });
      assert.ok(res.error);
    });

    it('rejects a Google Play subscription a missing product id', () => {
      const res =
        validators.subscriptionsGooglePlaySubscriptionValidator.validate({
          _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
          ...mockAbbrevPlayPurchase,
        });
      assert.ok(res.error);
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
      assert.ok(!res.error);
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

    it('accepts a list with Stripe and Google Play subscriptions', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [stripeSub, playSub],
        });
      assert.ok(!res.error);
    });

    it('accepts a list with only Stripe subscriptions', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [stripeSub, stripeSub],
        });
      assert.ok(!res.error);
    });

    it('accepts a list with only Google Play subscriptions', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [playSub, playSub],
        });
      assert.ok(!res.error);
    });

    it('allows an empty subscriptions list', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({
          subscriptions: [],
        });
      assert.ok(!res.error);
    });

    it('rejects when the subscriptions property is missing', () => {
      const res =
        validators.subscriptionsMozillaSubscriptionsValidator.validate({});
      assert.ok(res.error);
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
      product_id: 'prod_testo',
      product_name: 'LOL Daily',
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
        assert.ok(!res.error);
      });

      for (const x of required) {
        it(`rejects when the required property ${x} is not present`, () => {
          const s = { ...webSub, [x]: undefined };
          const res =
            validators.subscriptionsWebSubscriptionSupportValidator.validate(s);
          assert.ok(res.error);
        });
      }
    });

    describe('subscriptionsPlaySubscriptionSupportValidator', () => {
      const required = ['auto_renewing', 'expiry_time_millis', 'product_name'];

      it('accepts a valid Play subscription for the support-panel', () => {
        const res =
          validators.subscriptionsPlaySubscriptionSupportValidator.validate(
            playSub
          );
        assert.ok(!res.error);
      });

      for (const x of required) {
        it(`rejects when the required property ${x} is not present`, () => {
          const s = { ...playSub, [x]: undefined };
          const res =
            validators.subscriptionsWebSubscriptionSupportValidator.validate(s);
          assert.ok(res.error);
        });
      }
    });

    describe('subscriptionsSubscriptionSupportValidator', () => {
      it('accepts a valid response object', () => {
        const subs = {
          [MozillaSubscriptionTypes.WEB]: [webSub],
          [MozillaSubscriptionTypes.IAP_GOOGLE]: [playSub],
        };
        const res =
          validators.subscriptionsSubscriptionSupportValidator.validate(subs);
        assert.ok(!res.error);
      });

      it('accepts empty arrays', () => {
        const subs = {
          [MozillaSubscriptionTypes.WEB]: [],
          [MozillaSubscriptionTypes.IAP_GOOGLE]: [],
        };
        const res =
          validators.subscriptionsSubscriptionSupportValidator.validate(subs);
        assert.ok(!res.error);
      });
    });
  });

  describe('recovery codes', () => {
    it('allows base32 codes', () => {
      assert.notExists(
        validators
          .recoveryCodes(2, 10)
          .validate({ recoveryCodes: ['123456789A', '123456789B'] }).error
      );
    });

    it('allows base36 codes', () => {
      assert.notExists(
        validators
          .recoveryCodes(1, 10)
          .validate({ recoveryCodes: ['012345678L'] }).error
      );
    });

    it('detects missing recovery codes', () => {
      assert.exists(
        validators.recoveryCodes(2, 10).validate({ recoveryCodes: [] }).error
      );
      assert.exists(validators.recoveryCodes(2, 10).validate({}).error);
    });

    it('detects improper count', () => {
      assert.exists(
        validators.recoveryCodes(2, 10).validate({
          recoveryCodes: ['123456789A', '123456789B', '123456789C'],
        }).error
      );
    });

    it('detects duplicates', () => {
      assert.exists(
        validators
          .recoveryCodes(2, 10)
          .validate({ recoveryCodes: ['1234567890', '1234567890'] }).error
      );
    });

    it('detects allows less than maximum', () => {
      assert.exists(
        validators
          .recoveryCodes(2, 10)
          .validate({ recoveryCodes: ['123456789', '123456789'] }).error
      );
    });

    it('detects minimum', () => {
      assert.exists(
        validators.recoveryCodes(2, 10).validate({ recoveryCodes: ['', ''] })
          .error
      );
    });
  });

  describe('recovery code', () => {
    it('validates recovery codes', () => {
      assert.notExists(
        validators.recoveryCode(10).validate('0123456789').error
      );
    });

    it('invalidates recovery code', () => {
      assert.exists(validators.recoveryCode(10).validate('012345678-').error);
    });

    it('requires proper length', () => {
      assert.exists(validators.recoveryCode(5).validate('1234').error);
      assert.exists(validators.recoveryCode(11).validate('123456').error);
    });
  });
});
