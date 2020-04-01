/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* eslint-disable camelcase */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const pkg = require('../../package.json');
const logger = {
  info: sinon.spy(),
};
const amplitudeConfig = {
  disabled: false,
  rawEvents: false,
};

const amplitude = proxyquire(path.resolve('server/lib/amplitude'), {
  './configuration': {
    get(name) {
      if (name === 'oauth_client_id_map') {
        return {
          '0': 'amo',
          '1': 'pocket',
          '2': 'fx-monitor',
        };
      } else if (name === 'amplitude') {
        return amplitudeConfig;
      }
    },
  },
  './logging/log': () => logger,
});
const APP_VERSION = /([0-9]+)\.([0-9])$/.exec(pkg.version)[0];

registerSuite('amplitude', {
  beforeEach: function() {
    amplitudeConfig.disabled = false;
    amplitudeConfig.rawEvents = false;
    sinon.stub(process.stderr, 'write').callsFake(() => {});
  },

  afterEach: function() {
    process.stderr.write.restore();
    logger.info.resetHistory();
  },

  tests: {
    'app version seems sane': () => {
      assert.typeOf(APP_VERSION, 'string');
      assert.match(APP_VERSION, /([0-9]+)\.([0-9])$/);
    },

    'interface is correct': () => {
      assert.isFunction(amplitude);
      assert.lengthOf(amplitude, 3);
    },

    'disable writing amplitude events': {
      'logger.info was not called': () => {
        amplitudeConfig.disabled = true;
        amplitudeConfig.rawEvents = true;
        amplitude(
          {
            time: 'a',
            type: 'flow.signin_from.bar',
          },
          {
            connection: {},
            headers: {
              'x-forwarded-for': '63.245.221.32',
            },
          },
          {
            flowBeginTime: 'b',
            flowId: 'c',
            uid: 'd',
          }
        );

        assert.equal(logger.info.callCount, 0);
      },
    },

    'does not throw if arguments are missing': () => {
      assert.doesNotThrow(amplitude);
      assert.doesNotThrow(() => amplitude('foo'));
      assert.doesNotThrow(() => amplitude(null, {}));
    },

    'logs raw event with context': () => {
      amplitudeConfig.rawEvents = true;
      const event = {
        type: 'oauth.signup.success',
        offset: 3846,
        time: 1585695795375,
        flowTime: 3847,
      };

      const context = {
        eventSource: 'content',
        version: '1.164.0',
        emailTypes: {
          'complete-reset-password': 'reset_password',
          'complete-signin': 'login',
          'verify-email': 'registration',
        },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0 FxATester/1.0',
        deviceId: '6519d5fce18a427e87745ef6c25143ba',
        devices: [{ name: 'cray-1', lastAccessTime: 1585695795375 }],
        emailDomain: 'other',
        entrypoint_experiment: 'herf',
        entrypoint_variation: 'menk',
        entrypoint: 'zoo',
        experiments: ['abc', 'ASAP'],
        flowBeginTime: 1585695791528,
        flowId:
          '804e3ce43ed994db863afcb93640809c239f6db0378a6f2b01659f7e26e25a66',
        lang: 'en',
        location: {
          country: 'United States',
          state: 'California',
        },
        marketingOptIn: 'none',
        newsletters: 'none',
        planId: 'abc',
        productId: 'gamma',
        service: 'dcdb5ae7add825d2',
        syncEngines: ['bookmarks', 'history'],
        templateVersion: '3.1',
        uid: '66853f3ab5404b5f30674d532a2dd54e',
        userPreferences: { yes: 'no' },
        utm_campaign: 'none',
        utm_content: 'none',
        utm_medium: 'none',
        utm_source: 'none',
        utm_term: 'none',
      };
      amplitude(
        event,
        {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0 FxATester/1.0',
          },
        },
        {
          junk: 'dontpickthis',
          deviceId: '6519d5fce18a427e87745ef6c25143ba',
          devices: [{ name: 'cray-1', lastAccessTime: 1585695795375 }],
          emailDomain: 'other',
          entrypoint_experiment: 'herf',
          entrypoint_variation: 'menk',
          entrypoint: 'zoo',
          experiments: ['abc', 'ASAP'],
          flowBeginTime: 1585695791528,
          flowId:
            '804e3ce43ed994db863afcb93640809c239f6db0378a6f2b01659f7e26e25a66',
          lang: 'en',
          location: {
            country: 'United States',
            state: 'California',
          },
          marketingOptIn: 'none',
          newsletters: 'none',
          planId: 'abc',
          productId: 'gamma',
          service: 'dcdb5ae7add825d2',
          syncEngines: ['bookmarks', 'history'],
          templateVersion: '3.1',
          uid: '66853f3ab5404b5f30674d532a2dd54e',
          userPreferences: { yes: 'no' },
          utm_campaign: 'none',
          utm_content: 'none',
          utm_medium: 'none',
          utm_source: 'none',
          utm_term: 'none',
        }
      );

      assert.isTrue(
        logger.info.calledOnceWith('rawAmplitudeData', { event, context })
      );
    },

    'flow.reset-password.submit': () => {
      amplitude(
        {
          time: 'foo',
          type: 'flow.reset-password.submit',
        },
        {
          connection: {},
          headers: {
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:58.0) Gecko/20100101 Firefox/65.0',
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'bar',
          entrypoint: 'baz',
          entrypoint_experiment: 'exp',
          entrypoint_variation: 'var',
          experiments: [
            { choice: 'FirstExperiment', group: 'groupOne' },
            { choice: 'second-experiment', group: 'Group-Two' },
            { choice: 'THIRD_EXPERIMENT', group: 'group_three' },
            { choice: 'fourth.experiment', group: 'Group.FOUR' },
          ],
          flowBeginTime: 'qux',
          flowId: 'wibble',
          lang: 'blee',
          location: {
            country: 'United States',
            state: 'California',
          },
          service: '1',
          uid: 'soop',
          utm_campaign: 'melm',
          utm_content: 'florg',
          utm_medium: 'derp',
          utm_source: 'bnag',
          utm_term: 'plin',
        }
      );

      assert.equal(process.stderr.write.callCount, 0);
      assert.equal(logger.info.callCount, 1);
      const args = logger.info.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'amplitudeEvent');
      assert.deepEqual(args[1], {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'bar',
        event_properties: {
          oauth_client_id: '1',
          service: 'pocket',
        },
        event_type: 'fxa_login - forgot_submit',
        language: 'blee',
        op: 'amplitudeEvent',
        os_name: 'Mac OS X',
        os_version: '10.11',
        region: 'California',
        session_id: 'qux',
        time: 'foo',
        user_id: 'soop',
        user_properties: {
          entrypoint: 'baz',
          entrypoint_experiment: 'exp',
          entrypoint_variation: 'var',
          flow_id: 'wibble',
          ua_browser: 'Firefox',
          ua_version: '65.0',
          utm_campaign: 'melm',
          utm_content: 'florg',
          utm_medium: 'derp',
          utm_source: 'bnag',
          utm_term: 'plin',
          $append: {
            experiments: [
              'first_experiment_group_one',
              'second_experiment_group_two',
              'third_experiment_group_three',
              'fourth_experiment_group_four',
            ],
            fxa_services_used: 'pocket',
          },
        },
      });
    },

    'settings.change-password.success': () => {
      amplitude(
        {
          time: 'a',
          type: 'settings.change-password.success',
        },
        {
          connection: {},
          headers: {
            'user-agent':
              'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A406 Safari/8536.25',
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'b',
          entrypoint: 'c',
          experiments: [],
          flowBeginTime: 'd',
          flowId: 'e',
          lang: 'f',
          location: {
            country: 'United Kingdom',
            state: 'Dorset',
          },
          service: 'g',
          uid: 'h',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.deepEqual(logger.info.args[0][1], {
        app_version: APP_VERSION,
        country: 'United Kingdom',
        device_id: 'b',
        device_model: 'iPad',
        event_properties: {
          oauth_client_id: 'g',
          service: 'undefined_oauth',
        },
        event_type: 'fxa_pref - password',
        language: 'f',
        op: 'amplitudeEvent',
        os_name: 'iOS',
        os_version: '6.0',
        region: 'Dorset',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          $append: {
            fxa_services_used: 'undefined_oauth',
          },
          entrypoint: 'c',
          flow_id: 'e',
          ua_browser: 'Mobile Safari',
          ua_version: '6.0',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        },
      });
    },

    'settings.clients.disconnect.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'settings.clients.disconnect.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'b',
          flowBeginTime: 'c',
          flowId: 'd',
          lang: 'e',
          uid: 'f',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'settings.clients.disconnect.submit.suspicious': () => {
      amplitude(
        {
          time: 'a',
          type: 'settings.clients.disconnect.submit.suspicious',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'none',
          flowBeginTime: 'b',
          flowId: 'c',
          lang: 'd',
          uid: 'none',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_pref - disconnect_device');
      assert.equal(arg.event_properties.reason, 'suspicious');
      assert.isUndefined(arg.device_id);
      assert.isUndefined(arg.user_id);
    },

    'settings.clients.disconnect.submit.duplicate': () => {
      amplitude(
        {
          time: 'a',
          type: 'settings.clients.disconnect.submit.duplicate',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'b',
          flowBeginTime: 'c',
          flowId: 'd',
          lang: 'e',
          uid: 'f',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_pref - disconnect_device');
      assert.equal(arg.event_properties.reason, 'duplicate');
    },

    'settings.signout.success': () => {
      amplitude(
        {
          time: 'a',
          type: 'settings.signout.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_pref - logout');
    },

    'flow.update-firefox.view': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.update-firefox.view',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_notify - update_firefox_view'
      );
    },

    'flow.support.view': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.support.view',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
          product_id: 'pid',
          plan_id: 'plid',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_subscribe_support - view');
      assert.equal(arg.event_properties.product_id, 'pid');
      assert.equal(arg.event_properties.plan_id, 'plid');
    },

    'flow.update-firefox.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.update-firefox.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_notify - update_firefox_engage'
      );
    },

    'experiment.designF.passwordStrength.blocked': () => {
      amplitude(
        {
          time: 'a',
          type: 'experiment.designF.passwordStrength.blocked',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_reg - password_blocked'
      );
    },

    'flow.choose-what-to-sync.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.choose-what-to-sync.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - cwts_engage');
      assert.isUndefined(logger.info.args[0][1].user_properties.sync_engines);
    },

    'flow.enter-email.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.enter-email.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_email_first - engage'
      );
    },

    'flow.force-auth.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.force-auth.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - engage');
    },

    'flow.signin.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - engage');
    },

    'flow.signup.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signup.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'b',
          entrypoint: 'c',
          flowBeginTime: 'd',
          flowId: 'e',
          lang: 'f',
          location: {
            country: 'United States',
            state: 'California',
          },
          service: '1234',
          uid: 'h',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.deepEqual(logger.info.args[0][1], {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'b',
        event_properties: {
          oauth_client_id: '1234',
          service: 'undefined_oauth',
        },
        event_type: 'fxa_reg - engage',
        language: 'f',
        op: 'amplitudeEvent',
        region: 'California',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          $append: {
            fxa_services_used: 'undefined_oauth',
          },
          entrypoint: 'c',
          flow_id: 'e',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        },
      });
    },

    'flow.sms.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.sms.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - engage');
      assert.equal(arg.event_properties.connect_device_flow, 'sms');
      assert.equal(arg.event_properties.connect_device_os, undefined);
    },

    'flow.reset-password.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.reset-password.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'flow.signin-totp-code.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin-totp-code.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_login - totp_code_engage'
      );
    },

    'flow.support.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.support.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
          product_id: 'pid',
          plan_id: 'plid',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_subscribe_support - engage');
      assert.equal(arg.event_properties.product_id, 'pid');
      assert.equal(arg.event_properties.plan_id, 'plid');
    },

    'flow.install_from.foo': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.install_from.foo',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - view');
      assert.equal(arg.event_properties.connect_device_flow, 'store_buttons');
      assert.equal(arg.event_properties.connect_device_os, undefined);
    },

    'flow.signin_from.bar': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin_from.bar',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - view');
      assert.equal(arg.event_properties.connect_device_flow, 'signin');
      assert.equal(arg.event_properties.connect_device_os, undefined);
    },

    'flow.connect-another-device.link.app-store.foo': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.connect-another-device.link.app-store.foo',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - engage');
      assert.equal(arg.event_properties.connect_device_flow, 'store_buttons');
      assert.equal(arg.event_properties.connect_device_os, 'foo');
    },

    'flow.choose-what-to-sync.back': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.choose-what-to-sync.back',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_reg - cwts_back');
      assert.isUndefined(logger.info.args[0][1].user_properties.sync_engines);
    },

    'flow.signin.forgot-password': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin.forgot-password',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - forgot_pwd');
    },

    'flow.signin.have-account': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin.have-account',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - have_account');
    },

    'flow.choose-what-to-sync.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.choose-what-to-sync.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          syncEngines: ['wibble', 'blee'],
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - cwts_submit');
      assert.deepEqual(logger.info.args[0][1].user_properties.sync_engines, [
        'wibble',
        'blee',
      ]);
    },

    'flow.enter-email.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.enter-email.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_email_first - submit'
      );
    },

    'flow.force-auth.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - submit');
    },

    'flow.signin.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - submit');
    },

    'flow.signup.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signup.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - submit');
    },

    'flow.sms.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.sms.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - submit');
      assert.equal(arg.event_properties.connect_device_flow, 'sms');
      assert.equal(arg.event_properties.connect_device_os, undefined);
    },

    'flow.signin-totp-code.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin-totp-code.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_login - totp_code_submit'
      );
    },

    'flow.support.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.support.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
          product_id: 'pid',
          plan_id: 'plid',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_subscribe_support - submit');
      assert.equal(arg.event_properties.product_id, 'pid');
      assert.equal(arg.event_properties.plan_id, 'plid');
    },

    'flow.wibble.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.wibble.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'screen.choose-what-to-sync': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.choose-what-to-sync',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - cwts_view');
      assert.isUndefined(logger.info.args[0][1].user_properties.sync_engines);
    },

    'screen.enter-email': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.enter-email',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_email_first - view');
    },

    'screen.rp-button': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.rp-button',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_rp_button - view');
    },

    'screen.subscribe': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.subscribe',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_subscribe - view');
    },

    'screen.force-auth': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.force-auth',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - view');
    },

    'screen.signin': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.signin',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - view');
    },

    'screen.signup': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.signup',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - view');
    },

    'screen.oauth.signin': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.oauth.signin',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
          service: 'g',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_login - view');
      assert.equal(arg.event_properties.oauth_client_id, 'g');
    },

    'screen.signin.other_events': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.signin.other_events',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 0);
    },

    'screen.settings': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.settings',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_pref - view');
    },

    'screen.sms': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.sms',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'b',
          entrypoint: 'c',
          flowBeginTime: 'd',
          flowId: 'e',
          lang: 'f',
          location: {
            country: 'United States',
            state: 'California',
          },
          service: 'g',
          uid: 'h',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.deepEqual(logger.info.args[0][1], {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'b',
        event_properties: {
          connect_device_flow: 'sms',
          oauth_client_id: 'g',
          service: 'undefined_oauth',
        },
        event_type: 'fxa_connect_device - view',
        language: 'f',
        op: 'amplitudeEvent',
        region: 'California',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          $append: {
            fxa_services_used: 'undefined_oauth',
          },
          entrypoint: 'c',
          flow_id: 'e',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        },
      });
    },

    'screen.reset-password': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.reset-password',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'screen.signin-totp-code': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.signin-totp-code',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );
      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_login - totp_code_view'
      );
    },

    'screen.settings.two-step-authentication': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.settings.two-step-authentication',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );
      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - two_step_authentication_view'
      );
    },

    'settings.communication-preferences.optIn.success': () => {
      amplitude(
        {
          time: 'a',
          type: 'settings.communication-preferences.optIn.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_pref - newsletter');
      assert.equal(arg.user_properties.newsletter_state, 'subscribed');
    },

    'settings.communication-preferences.optOut.success': () => {
      amplitude(
        {
          time: 'a',
          type: 'settings.communication-preferences.optOut.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_pref - newsletter');
      assert.equal(arg.user_properties.newsletter_state, 'unsubscribed');
    },

    'flow.signin-totp-code.success': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.signin-totp-code.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_login - totp_code_success'
      );
    },

    'flow.support.success': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.support.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
          product_id: 'pid',
          plan_id: 'plid',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_subscribe_support - success');
      assert.equal(arg.event_properties.product_id, 'pid');
      assert.equal(arg.event_properties.plan_id, 'plid');
    },

    'flow.support.fail': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.support.fail',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
          product_id: 'pid',
          plan_id: 'plid',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_subscribe_support - fail');
      assert.equal(arg.event_properties.product_id, 'pid');
      assert.equal(arg.event_properties.plan_id, 'plid');
    },

    'settings.communication-preferences.wibble.success': () => {
      amplitude(
        {
          time: 'a',
          type: 'settings.communication-preferences.wibble.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'complete-reset-password.verification.clicked': () => {
      amplitude(
        {
          time: 'a',
          type: 'complete-reset-password.verification.clicked',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'b',
          emailDomain: 'other',
          entrypoint: 'c',
          flowBeginTime: 'd',
          flowId: 'e',
          lang: 'f',
          location: {
            country: 'United States',
            state: 'California',
          },
          service: 'sync',
          uid: 'h',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.deepEqual(logger.info.args[0][1], {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'b',
        event_properties: {
          email_provider: 'other',
          email_sender: undefined,
          email_service: undefined,
          email_type: 'reset_password',
          service: 'sync',
        },
        event_type: 'fxa_email - click',
        language: 'f',
        op: 'amplitudeEvent',
        region: 'California',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          $append: {
            fxa_services_used: 'sync',
          },
          entrypoint: 'c',
          flow_id: 'e',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        },
      });
    },

    'complete-signin.verification.clicked': () => {
      amplitude(
        {
          time: 'a',
          type: 'complete-signin.verification.clicked',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          emailDomain: 'none',
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_email - click');
      assert.equal(arg.event_properties.email_provider, undefined);
      assert.equal(arg.event_properties.email_type, 'login');
    },

    'verify-email.verification.clicked': () => {
      amplitude(
        {
          time: 'a',
          type: 'verify-email.verification.clicked',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_email - click');
      assert.equal(arg.event_properties.email_provider, undefined);
      assert.equal(arg.event_properties.email_type, 'registration');
    },

    'wibble.verification.success': () => {
      amplitude(
        {
          time: 'a',
          type: 'wibble.verification.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'cached.signin.success': () => {
      amplitude(
        {
          time: 'foo',
          type: 'cached.signin.success',
        },
        {
          connection: {},
          headers: {
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:58.0) Gecko/20100101 Firefox/65.0',
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'qux',
          flowId: 'wibble',
          lang: 'blee',
          service: '1',
          uid: 'soop',
        }
      );

      assert.equal(process.stderr.write.callCount, 0);
      assert.equal(logger.info.callCount, 1);
      const args = logger.info.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'amplitudeEvent');
      assert.deepEqual(args[1], {
        app_version: APP_VERSION,
        event_properties: {
          oauth_client_id: '1',
          service: 'pocket',
        },
        event_type: 'fxa_login - complete',
        language: 'blee',
        op: 'amplitudeEvent',
        os_name: 'Mac OS X',
        os_version: '10.11',
        session_id: 'qux',
        time: 'foo',
        user_id: 'soop',
        user_properties: {
          flow_id: 'wibble',
          ua_browser: 'Firefox',
          ua_version: '65.0',
          $append: {
            fxa_services_used: 'pocket',
          },
        },
      });
    },

    'screen.confirm-signup-code': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.confirm-signup-code',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_reg - signup_code_view'
      );
      assert.isUndefined(logger.info.args[0][1].user_properties.sync_engines);
    },

    'flow.confirm-signup-code.engage': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.confirm-signup-code.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_reg - signup_code_engage'
      );
      assert.isUndefined(logger.info.args[0][1].user_properties.sync_engines);
    },

    'flow.confirm-signup-code.submit': () => {
      amplitude(
        {
          time: 'a',
          type: 'flow.confirm-signup-code.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_reg - signup_code_submit'
      );
      assert.isUndefined(logger.info.args[0][1].user_properties.sync_engines);
    },

    'screen.connect-another-device': () => {
      amplitude(
        {
          time: 'a',
          type: 'screen.connect-another-device',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          uid: 'd',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - view');
    },

    'flow.rp.engage': () => {
      amplitude(
        {
          flowTime: 'b',
          time: 'a',
          type: 'flow.rp.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: 'b',
          flowId: 'c',
          service: '2',
          uid: 'ca11ab1efo1dab1e5a1eab1e5ca1ab1e',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_rp - engage');
      assert.equal(arg.event_properties.oauth_client_id, '2');
      assert.equal(arg.event_properties.service, 'fx-monitor');
      assert.equal(arg.time, 'a');
      assert.equal(arg.user_id, 'ca11ab1efo1dab1e5a1eab1e5ca1ab1e');
    },

    'screen.pair': () => {
      amplitude(
        {
          time: '1582051365965',
          type: 'screen.pair',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1582051366041',
          flowId:
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0ac',
          uid: 'none',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - view');
      assert.equal(arg.event_properties.connect_device_flow, 'pairing');
    },

    'flow.pair.submit': () => {
      amplitude(
        {
          time: '1582051365965',
          type: 'flow.pair.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1582051366041',
          flowId:
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0ac',
          uid: 'none',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - submit');
      assert.equal(arg.event_properties.connect_device_flow, 'pairing');
    },
  },
});
