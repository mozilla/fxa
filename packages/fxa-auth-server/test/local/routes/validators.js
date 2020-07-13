/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const validators = require('../../../lib/routes/validators');

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

    it('accepts an empty object', () => {
      const res = subject.validate({});
      assert.ok(!res.error);
    });

    it('rejects a non-object', () => {
      const res = subject.validate(123);
      assert.ok(res.error);
    });

    it('accepts unexpected keys', () => {
      const res = subject.validate({
        'capabilities:8675309': '123done,321done',
        newThing: 'this is unexpected',
      });
      assert.ok(!res.error);
    });

    it('rejects expected keys with invalid values', () => {
      const res = subject.validate({
        iconURL: true,
      });
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
        product_metadata: {
          productSet: '123done',
          productOrder: 0,
          iconURL: 'http://example.org',
          downloadURL: 'http://example.org',
          upgradeCTA: 'hello <a href="http://example.org">world</a>',
          newThing: 'this is unexpected',
          'capabilities:8675309': '123done,321done',
        },
      };
      const res = subject.validate(plan);
      assert.ok(!res.error);
    });

    it('rejects invalid product metadata', () => {
      const plan = {
        ...basePlan,
        product_metadata: {
          iconURL: true,
        },
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
});
