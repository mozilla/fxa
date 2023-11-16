/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const DAY = 1000 * 60 * 60 * 24;
const WEEK = DAY * 7;
const FOUR_WEEKS = WEEK * 4;
const APP_VERSION = /^([0-9]+)\.([0-9]+)$/; // Matches `XXX.X` version number
const deepCopy = (object) => JSON.parse(JSON.stringify(object));

describe('metrics/amplitude:', () => {
  let amplitude;

  before(() => {
    amplitude = require('../../metrics/amplitude').amplitude;
  });

  it('exports the event groups', () => {
    assert.isObject(amplitude.GROUPS);
    assert.isString(amplitude.GROUPS.activity);
    assert.isString(amplitude.GROUPS.connectDevice);
    assert.isString(amplitude.GROUPS.email);
    assert.isString(amplitude.GROUPS.emailFirst);
    assert.isString(amplitude.GROUPS.login);
    assert.isString(amplitude.GROUPS.notify);
    assert.isString(amplitude.GROUPS.registration);
    assert.isString(amplitude.GROUPS.settings);
  });

  it('has an EVENT_PROPERTIES entry for each group', () => {
    for (const group of Object.keys(amplitude.GROUPS)) {
      const groupName = amplitude.GROUPS[group];
      assert.isFunction(amplitude.EVENT_PROPERTIES[groupName], group);
    }
  });

  it('exports an initialize method', () => {
    assert.isFunction(amplitude.initialize);
    assert.lengthOf(amplitude.initialize, 3);
  });

  describe('initialize:', () => {
    let transform;

    before(() => {
      transform = amplitude.initialize(
        {
          foo: 'bar',
          baz: 'qux',
        },
        {
          sourceEvent1: {
            group: amplitude.GROUPS.activity,
            event: 'wibble',
          },
          sourceEvent2: {
            group: amplitude.GROUPS.connectDevice,
            event: 'blee',
          },
          'settings.change-password.success': {
            group: amplitude.GROUPS.settings,
            event: 'password',
          },
        },
        new Map([
          [
            /3/,
            {
              group: amplitude.GROUPS.login,
              event: 'targetEvent3',
            },
          ],
          [
            /^(wibble)\.(blee)/,
            {
              group: (eventCategory) =>
                eventCategory === 'wibble'
                  ? amplitude.GROUPS.registration
                  : null,
              event: 'targetEvent4',
            },
          ],
          [
            /wobble\.(\w+)\.(\w+)/,
            {
              group: amplitude.GROUPS.login,
              event: (eventCategory, eventTarget) =>
                `${eventCategory}.${eventTarget}`,
            },
          ],
          [
            /(pair)\.(\w+)/,
            {
              group: amplitude.GROUPS.connectDevice,
              event: 'cadEvent',
            },
          ],
          [
            /(verifySecondaryCodeEmail)\.(\w+)/,
            {
              group: amplitude.GROUPS.email,
              event: 'emailEvent',
            },
          ],
          [
            /disconnect\.(\w+)\.(\w+)/,
            {
              group: amplitude.GROUPS.settings,
              event: 'disconnect_device',
            },
          ],
          [
            /newsletter\.(\w+)\.(\w+)/,
            {
              group: amplitude.GROUPS.settings,
              event: 'newsletterEvent',
            },
          ],
          [
            /newsletters\.(\w+)\.(\w+)/,
            {
              group: amplitude.GROUPS.settings,
              event: 'newsletters',
            },
          ],
          [
            /^(fxa_pay_setup)\.([\w-]+)/,
            {
              group: amplitude.GROUPS.subPaySetup,
              event: 'payment',
            },
          ],
        ])
      );
    });

    describe('transform a simple event:', () => {
      let now, result;

      before(() => {
        now = Date.now();
        result = transform(
          {
            type: 'sourceEvent2',
            time: 42,
          },
          {
            browser: 'a',
            browserVersion: 'b',
            country: 'c',
            deviceId: 'd',
            devices: [
              { lastAccessTime: now - DAY + 1000 },
              { lastAccessTime: now - DAY - 1 },
              { lastAccessTime: now - WEEK + 1000 },
              { lastAccessTime: now - WEEK - 1 },
              { lastAccessTime: now - FOUR_WEEKS + 1000 },
              { lastAccessTime: now - FOUR_WEEKS - 1 },
            ],
            emailDomain: 'e',
            entrypoint: 'f',
            entrypoint_experiment: 'exp',
            entrypoint_variation: 'var',
            experiments: [
              { choice: 'g', group: 'h' },
              { choice: 'iI', group: 'jJ-J' },
            ],
            flowBeginTime: 'k',
            flowId: 'l',
            formFactor: 'm',
            lang: 'n',
            os: 'p',
            osVersion: 'q',
            planId: 'plid',
            productId: 'pid',
            region: 'r',
            service: 'baz',
            syncEngines: ['wibble', 'blee'],
            templateVersion: 's',
            uid: 't',
            userPreferences: {
              'account-recovery': true,
            },
            utm_campaign: 'u',
            utm_content: 'v',
            utm_medium: 'w',
            utm_referrer: 'z',
            utm_source: 'x',
            utm_term: 'y',
          }
        );
      });

      it('returned the correct result', () => {
        // HACK: app_version is set if the tests are run in the monorepo but not if
        //       they're run inside a container, due to the resolution or otherwise
        //       of `require('../../../package.json')` in metrics/amplitude.js
        if (result.app_version) {
          assert.equal(APP_VERSION.test(result.app_version), true);
        }
        delete result.app_version;
        assert.deepEqual(result, {
          country: 'c',
          device_id: 'd',
          device_model: 'm',
          event_properties: {
            oauth_client_id: 'baz',
            plan_id: 'plid',
            product_id: 'pid',
            service: 'qux',
          },
          event_type: 'fxa_connect_device - blee',
          language: 'n',
          op: 'amplitudeEvent',
          os_name: 'p',
          os_version: 'q',
          region: 'r',
          session_id: 'k',
          time: 42,
          user_id: 't',
          user_properties: {
            $append: {
              account_recovery: true,
              experiments: ['g_h', 'i_i_j_j_j'],
              fxa_services_used: 'qux',
            },
            entrypoint: 'f',
            entrypoint_experiment: 'exp',
            entrypoint_variation: 'var',
            flow_id: 'l',
            sync_active_devices_day: 1,
            sync_active_devices_month: 5,
            sync_active_devices_week: 3,
            sync_device_count: 6,
            sync_engines: ['wibble', 'blee'],
            ua_browser: 'a',
            ua_version: 'b',
            utm_campaign: 'u',
            utm_content: 'v',
            utm_medium: 'w',
            utm_referrer: 'z',
            utm_source: 'x',
            utm_term: 'y',
          },
        });
      });
    });

    describe('transform a fuzzy event:', () => {
      let result;

      before(() => {
        result = transform(
          {
            type: 'sourceEvent3',
            time: 1,
          },
          {
            deviceId: 'a',
            flowBeginTime: 'b',
            flowId: 'c',
            syncEngines: [],
            uid: 'd',
          }
        );
      });

      it('returned the correct result', () => {
        // HACK: app_version is set if the tests are run in the monorepo but not if
        //       they're run inside a container, due to the resolution or otherwise
        //       of `require('../../../package.json')` in metrics/amplitude.js
        if (result.app_version) {
          assert.equal(APP_VERSION.test(result.app_version), true);
        }
        delete result.app_version;
        assert.deepEqual(result, {
          device_id: 'a',
          event_properties: {},
          event_type: 'fxa_login - targetEvent3',
          op: 'amplitudeEvent',
          session_id: 'b',
          time: 1,
          user_id: 'd',
          user_properties: {
            flow_id: 'c',
          },
        });
      });
    });

    describe('transform a fuzzy event with a group function:', () => {
      let result;

      before(() => {
        result = transform({ type: 'wibble.blee' }, {});
      });

      it('returned the correct event type', () => {
        assert.equal(result.event_type, 'fxa_reg - targetEvent4');
      });
    });

    describe('transform a fuzzy event with an event function:', () => {
      let result;

      before(() => {
        result = transform({ type: 'wobble.glick.gluck' }, {});
      });

      it('returned the correct event type', () => {
        assert.equal(result.event_type, 'fxa_login - glick.gluck');
      });
    });

    describe('transform an event with connect-another-device properties:', () => {
      let result;

      before(() => {
        result = transform({ type: 'pair.ios' }, {});
      });

      it('returned the correct event data', () => {
        assert.equal(result.event_type, 'fxa_connect_device - cadEvent');
        assert.deepEqual(result.event_properties, {
          connect_device_flow: 'pairing',
          connect_device_os: 'ios',
        });
      });
    });

    describe('transform an event with email properties:', () => {
      let result;

      before(() => {
        result = transform(
          { type: 'verifySecondaryCodeEmail.wibble' },
          {
            emailDomain: 'foo',
            emailTypes: {
              verifySecondaryCodeEmail: 'secondary_email',
            },
            templateVersion: 'bar',
          }
        );
      });

      it('returned the correct event data', () => {
        assert.equal(result.event_type, 'fxa_email - emailEvent');
        assert.deepEqual(result.event_properties, {
          email_provider: 'foo',
          email_template: 'verifySecondaryCodeEmail',
          email_type: 'secondary_email',
          email_version: 'bar',
        });
      });
    });

    describe('transform an event with disconnect properties:', () => {
      let result;

      before(() => {
        result = transform({ type: 'disconnect.wibble.blee' }, {});
      });

      it('returned the correct event data', () => {
        assert.equal(result.event_type, 'fxa_pref - disconnect_device');
        assert.deepEqual(result.event_properties, { reason: 'wibble' });
      });
    });

    describe('transform an event with newsletters optIn properties:', () => {
      let result;

      before(() => {
        result = transform(
          { type: 'newsletters.optIn.wibble' },
          {
            newsletters: ['test-pilot'],
          }
        );
      });

      it('returned the correct event data', () => {
        assert.equal(result.event_type, 'fxa_pref - newsletters');
        assert.deepEqual(result.user_properties, {
          newsletter_state: 'subscribed',
          newsletters: ['test_pilot'],
        });
      });
    });

    describe('transform an event with undefined service:', () => {
      let result;

      before(() => {
        result = transform({ type: 'wibble.blee' }, { service: 'gribble' });
      });

      it('returned the correct event data', () => {
        assert.deepEqual(result.event_properties, {
          oauth_client_id: 'gribble',
          service: 'undefined_oauth',
        });
        assert.deepEqual(result.user_properties, {
          $append: { fxa_services_used: 'undefined_oauth' },
        });
      });
    });

    describe('transform an event with service=sync:', () => {
      let result;

      before(() => {
        result = transform({ type: 'wibble.blee' }, { service: 'sync' });
      });

      it('returned the correct event data', () => {
        assert.deepEqual(result.event_properties, { service: 'sync' });
        assert.deepEqual(result.user_properties, {
          $append: { fxa_services_used: 'sync' },
        });
      });
    });

    describe('transform an event with service=content-server:', () => {
      let result;

      before(() => {
        result = transform(
          { type: 'wibble.blee' },
          { service: 'content-server' }
        );
      });

      it('returned the correct event data', () => {
        assert.deepEqual(result.event_properties, {});
        assert.deepEqual(result.user_properties, {});
      });
    });

    describe('transform an event with subscription event details:', () => {
      it('did not include the subscription event details in event properties when the event was not in the fxa_pay_setup group', () => {
        const actual = transform(
          { type: 'wibble.blee' },
          { sourceCountry: 'GD', checkoutType: 'without-account' }
        );
        assert.deepEqual(actual.event_properties, {});
      });

      it('did not include the subscription event details in event properties when none was found', () => {
        const actual = transform({ type: 'fxa_pay_setup.blee.quuz' }, {});
        assert.deepEqual(actual.event_properties, {});
      });

      it('returned the correct subscription event details event properties', () => {
        const actual = transform(
          { type: 'fxa_pay_setup.blee.quuz' },
          { country_code_source: 'GD', checkoutType: 'without-account' }
        );
        assert.deepEqual(actual.event_properties, {
          country_code_source: 'GD',
          checkout_type: 'without-account',
        });
      });
    });
  });

  describe('validate', () => {
    const minimumEvent = {
      device_id: '9ce8626e11ab4238981287fb95c8545e',
      event_properties: {
        service: 'qux',
      },
      event_type: 'fxa_connect_device - blee',
      op: 'amplitudeEvent',
      time: 1680884839890,
      user_id: '9ce8626e11ab4238981287fb95c8545e',
      user_properties: {
        flow_id:
          'aed8442f52e9af1694ff13bf1f4523815e651e0c0e7242c72fb46069fa9adaee',
      },
    };
    it('success', () => {
      const result = amplitude.validate(minimumEvent);
      assert.isTrue(result);
    });

    it('success if country_code is 2 characters code', () => {
      const event = {
        ...minimumEvent,
        country_code: 'US',
      };
      const result = amplitude.validate(event);
      assert.isTrue(result);
    });

    it('errors - op required', () => {
      const event = {
        ...minimumEvent,
      };
      delete event.op;
      try {
        amplitude.validate(event);
        assert.fail('Validate is expected to fail');
      } catch (err) {
        assert.isTrue(err instanceof Error);
        assert.equal(
          err.message,
          `Invalid data: event must have required property 'op'`
        );
      }
    });

    it('errors - event_type required', () => {
      const event = {
        ...minimumEvent,
      };
      delete event.event_type;
      try {
        amplitude.validate(event);
        assert.fail('Validate is expected to fail');
      } catch (err) {
        assert.isTrue(err instanceof Error);
        assert.equal(
          err.message,
          `Invalid data: event must have required property 'event_type'`
        );
      }
    });

    it('errors - time required', () => {
      const event = {
        ...minimumEvent,
      };
      delete event.time;
      try {
        amplitude.validate(event);
        assert.fail('Validate is expected to fail');
      } catch (err) {
        assert.isTrue(err instanceof Error);
        assert.equal(
          err.message,
          `Invalid data: event must have required property 'time'`
        );
      }
    });

    it('errors - event_properties required', () => {
      const event = {
        ...minimumEvent,
      };
      delete event.event_properties;
      try {
        amplitude.validate(event);
        assert.fail('Validate is expected to fail');
      } catch (err) {
        assert.isTrue(err instanceof Error);
        assert.equal(
          err.message,
          `Invalid data: event must have required property 'event_properties'`
        );
      }
    });

    it('errors - user_properties required', () => {
      const event = {
        ...minimumEvent,
      };
      delete event.user_properties;
      try {
        amplitude.validate(event);
        assert.fail('Validate is expected to fail');
      } catch (err) {
        assert.isTrue(err instanceof Error);
        assert.equal(
          err.message,
          `Invalid data: event must have required property 'user_properties'`
        );
      }
    });

    it('errors if country_code is more than 2 characters', () => {
      const event = {
        ...minimumEvent,
        country_code: 'USA',
      };
      try {
        amplitude.validate(event);
        assert.fail('Validate is expected to fail');
      } catch (err) {
        assert.isTrue(err instanceof Error);
        assert.equal(
          err.message,
          `Invalid data: event/country_code must match pattern "^[A-Z]{2}$"`
        );
      }
    });

    it('errors if country_code less than 2 characters', () => {
      const event = {
        ...minimumEvent,
        country_code: 'U',
      };
      try {
        amplitude.validate(event);
        assert.fail('Validate is expected to fail');
      } catch (err) {
        assert.isTrue(err instanceof Error);
        assert.equal(
          err.message,
          `Invalid data: event/country_code must match pattern "^[A-Z]{2}$"`
        );
      }
    });

    describe('fxa_pay_setup - * events', () => {
      const fxa_pay_setup_event = {
        country_code: 'RO',
        device_id: '9ce8626e11ab4238981287fb95c8545e',
        op: 'amplitudeEvent',
        time: 1680884839890,
        user_id: '9ce8626e11ab4238981287fb95c8545e',
        event_type: 'fxa_pay_setup - view',
        language: 'en',
        user_properties: {
          flow_id:
            'aed8442f52e9af1694ff13bf1f4523815e651e0c0e7242c72fb46069fa9adaee',
        },
        event_properties: {
          country_code_source: 'DE',
          service: 'qux',
          product_id: 'product',
          plan_id: 'plan',
          checkout_type: 'without-account',
          payment_provider: 'apple',
          promotion_code: 'Wow_Sale',
          subscribed_plan_ids: 'plan_123, plan_abc',
        },
      };

      it('success - valid with all required and all optional properties', () => {
        const event = deepCopy(fxa_pay_setup_event);
        const result = amplitude.validate(event);
        assert.isTrue(result);
      });
      it('success - valid with only required and none of the optional properties', () => {
        const eventNoOptional = deepCopy(fxa_pay_setup_event);
        delete eventNoOptional.country_code;
        delete eventNoOptional.event_properties.country_code_source;
        delete eventNoOptional.event_properties.error_id;
        delete eventNoOptional.event_properties.payment_provider;
        delete eventNoOptional.event_properties.promotion_code;
        delete eventNoOptional.event_properties.subscribed_plan_ids;
        delete eventNoOptional.user_id;
        const result = amplitude.validate(eventNoOptional);
        assert.isTrue(result);
      });
      it('error - all required fields are missing', () => {
        const eventNoRequired = deepCopy(fxa_pay_setup_event);
        // We can't delete event_type, since that is required for matching
        // the if/then validation blocks
        delete eventNoRequired.event_properties.checkout_type;
        delete eventNoRequired.user_properties.flow_id;
        delete eventNoRequired.language;
        delete eventNoRequired.event_properties.plan_id;
        delete eventNoRequired.event_properties.product_id;
        delete eventNoRequired.time;

        try {
          amplitude.validate(eventNoRequired);
          assert.fail('Validate is expected to fail');
        } catch (err) {
          assert.isTrue(err instanceof Error);
          assert.equal(
            err.message,
            `Invalid data: event must have required property 'language', event/user_properties must have required property 'flow_id', event/event_properties must have required property 'plan_id', event/event_properties must have required property 'product_id', event must match "then" schema, event/event_properties must have required property 'checkout_type', event must match "then" schema, event must have required property 'time'`
          );
        }
      });
      describe('fxa_pay_setup - submit events', () => {
        it('error - required field(s) are missing', () => {
          const eventNoRequired = deepCopy(fxa_pay_setup_event);
          eventNoRequired.event_type = 'fxa_pay_setup - submit';
          delete eventNoRequired.event_properties.payment_provider;

          try {
            amplitude.validate(eventNoRequired);
            assert.fail('Validate is expected to fail');
          } catch (err) {
            assert.isTrue(err instanceof Error);
            assert.equal(
              err.message,
              `Invalid data: event/event_properties must have required property 'payment_provider', event must match "then" schema`
            );
          }
        });
      });
      describe('fxa_pay_setup - success events', () => {
        it('error - required field(s) are missing', () => {
          const eventNoRequired = deepCopy(fxa_pay_setup_event);
          eventNoRequired.event_type = 'fxa_pay_setup - success';
          delete eventNoRequired.event_properties.payment_provider;

          try {
            amplitude.validate(eventNoRequired);
            assert.fail('Validate is expected to fail');
          } catch (err) {
            assert.isTrue(err instanceof Error);
            assert.equal(
              err.message,
              `Invalid data: event/event_properties must have required property 'payment_provider', event must match "then" schema`
            );
          }
        });
      });
      describe('fxa_pay_setup - fail events', () => {
        it('error - required field(s) are missing', () => {
          const eventNoRequired = deepCopy(fxa_pay_setup_event);
          eventNoRequired.event_type = 'fxa_pay_setup - fail';
          delete eventNoRequired.event_properties.payment_provider;

          try {
            amplitude.validate(eventNoRequired);
            assert.fail('Validate is expected to fail');
          } catch (err) {
            assert.isTrue(err instanceof Error);
            assert.equal(
              err.message,
              `Invalid data: event/event_properties must have required property 'payment_provider', event must match "then" schema, event/event_properties must have required property 'error_id', event must match "then" schema`
            );
          }
        });
      });
    });

    describe('fxa_pay_subscription_change - * events', () => {
      const fxa_pay_subscription_change_event = {
        country_code: 'RO',
        device_id: '9ce8626e11ab4238981287fb95c8545e',
        op: 'amplitudeEvent',
        time: 1680884839890,
        user_id: '9ce8626e11ab4238981287fb95c8545e',
        language: 'en',
        user_properties: {
          flow_id:
            'aed8442f52e9af1694ff13bf1f4523815e651e0c0e7242c72fb46069fa9adaee',
        },
        event_type: 'fxa_pay_subscription_change - view',
        event_properties: {
          service: 'qux',
          product_id: 'product',
          plan_id: 'plan',
          previous_plan_id: 'oldPlan',
          previous_product_id: 'oldProduct',
          subscription_id: 'subId',
          payment_provider: 'stripe',
          promotion_code: 'Wow_Sale',
          subscribed_plan_ids: 'plan_123, plan_abc',
        },
      };
      it('success - valid with all required and all optional properties', () => {
        const event = deepCopy(fxa_pay_subscription_change_event);
        const result = amplitude.validate(event);
        assert.isTrue(result);
      });
      it('success - valid with only required and none of the optional properties', () => {
        const eventNoOptional = deepCopy(fxa_pay_subscription_change_event);
        delete eventNoOptional.country_code;
        delete eventNoOptional.event_properties.error_id;
        delete eventNoOptional.event_properties.promotion_code;
        delete eventNoOptional.event_properties.subscribed_plan_ids;
        const result = amplitude.validate(eventNoOptional);
        assert.isTrue(result);
      });
      it('error - all required fields are missing', () => {
        const eventNoRequired = deepCopy(fxa_pay_subscription_change_event);
        // We can't delete event_type, since that is required for matching
        // the if/then validation blocks
        delete eventNoRequired.user_properties.flow_id;
        delete eventNoRequired.language;
        delete eventNoRequired.event_properties.payment_provider;
        delete eventNoRequired.event_properties.plan_id;
        delete eventNoRequired.event_properties.previous_plan_id;
        delete eventNoRequired.event_properties.previous_product_id;
        delete eventNoRequired.event_properties.product_id;
        delete eventNoRequired.event_properties.subscription_id;
        delete eventNoRequired.time;
        delete eventNoRequired.user_id;

        try {
          amplitude.validate(eventNoRequired);
          assert.fail('Validate is expected to fail');
        } catch (err) {
          assert.isTrue(err instanceof Error);
          assert.equal(
            err.message,
            `Invalid data: event must have required property 'language', event/user_properties must have required property 'flow_id', event/event_properties must have required property 'plan_id', event/event_properties must have required property 'product_id', event must match "then" schema, event must have required property 'user_id', event/event_properties must have required property 'previous_plan_id', event/event_properties must have required property 'previous_product_id', event/event_properties must have required property 'subscription_id', event/event_properties must have required property 'payment_provider', event must match "then" schema, event must have required property 'time'`
          );
        }
      });
      describe('fxa_pay_subscription_change - fail events', () => {
        it('error - required field(s) are missing', () => {
          const eventNoRequired = deepCopy(fxa_pay_subscription_change_event);
          eventNoRequired.event_type = 'fxa_pay_subscription_change - fail';

          try {
            amplitude.validate(eventNoRequired);
            assert.fail('Validate is expected to fail');
          } catch (err) {
            assert.isTrue(err instanceof Error);
            assert.equal(
              err.message,
              `Invalid data: event/event_properties must have required property 'error_id', event must match "then" schema`
            );
          }
        });
      });
    });

    describe('fxa_subscribe - subscription_ended', () => {
      const subscriptionEndedEvent = {
        device_id: '9ce8626e11ab4238981287fb95c8545e',
        event_type: 'fxa_subscribe - subscription_ended',
        language: 'piglatin',
        op: 'amplitudeEvent',
        time: 1680884839890,
        user_id: '9ce8626e11ab4238981287fb95c8545e',
        user_properties: {},
        event_properties: {
          country_code: 'BC',
          payment_provider: 'stripe',
          plan_id: 'def',
          product_id: 'ghi',
          provider_event_id: 'jkl',
          subscription_id: 'mno',
          voluntary_cancellation: true,
        },
      };

      it('success - valid with all required and all optional properties', () => {
        const event = {
          ...subscriptionEndedEvent,
        };
        const result = amplitude.validate(event);
        assert.isTrue(result);
      });

      it('success - valid with only required and none of the optional properties', () => {
        const event = {
          ...subscriptionEndedEvent,
        };
        delete event.user_id;

        const result = amplitude.validate(event);
        assert.isTrue(result);
      });

      it('error - all fields (required or optional) are missing', () => {
        const event = {
          ...subscriptionEndedEvent,
        };
        delete event.event_properties;
        delete event.event_type;
        delete event.language;
        delete event.time;
        delete event.user_id;

        try {
          amplitude.validate(event);
          assert.fail('Validate is expected to fail');
        } catch (err) {
          assert.isTrue(err instanceof Error);
          assert.equal(
            err.message,
            `Invalid data: event must have required property 'event_type', event must have required property 'time', event must have required property 'event_properties'`
          );
        }
      });

      it('error - all required fields are missing', () => {
        const event = {
          ...subscriptionEndedEvent,
        };
        delete event.event_type;
        delete event.language;
        delete event.time;
        delete event.event_properties;

        try {
          amplitude.validate(event);
          assert.fail('Validate is expected to fail');
        } catch (err) {
          assert.isTrue(err instanceof Error);
          assert.equal(
            err.message,
            `Invalid data: event must have required property 'event_type', event must have required property 'time', event must have required property 'event_properties'`
          );
        }
      });

      it('error - one required field is missing', () => {
        const event = {
          ...subscriptionEndedEvent,
        };
        delete event.time;

        try {
          amplitude.validate(event);
          assert.fail('Validate is expected to fail');
        } catch (err) {
          assert.isTrue(err instanceof Error);
          assert.equal(
            err.message,
            `Invalid data: event must have required property 'time', event must match "then" schema, event must have required property 'time'`
          );
        }
      });

      it('error - one required event properties field is missing', () => {
        const event = {
          ...subscriptionEndedEvent,
        };
        delete event.event_properties.plan_id;

        try {
          amplitude.validate(event);
          assert.fail('Validate is expected to fail');
        } catch (err) {
          assert.isTrue(err instanceof Error);
          assert.equal(
            err.message,
            `Invalid data: event/event_properties must have required property 'plan_id', event must match "then" schema`
          );
        }
      });
    });
  });
});
