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
const statsd = {
  increment: sinon.spy(),
};
const amplitudeConfig = {
  disabled: false,
  rawEvents: false,
  schemaValidation: false,
};

const amplitude = proxyquire(path.resolve('server/lib/amplitude'), {
  './configuration': {
    get(name) {
      if (name === 'oauth_client_id_map') {
        return {
          0: 'amo',
          1: 'pocket',
          2: 'fx-monitor',
        };
      } else if (name === 'amplitude') {
        return amplitudeConfig;
      }
    },
  },
  './logging/log': () => logger,
  './statsd': statsd,
});

const APP_VERSION_RE = /([0-9]+)\.([0-9]{1,2})$/;
const APP_VERSION = APP_VERSION_RE.exec(pkg.version)[0];

const getBasicEvent = (type) => ({
  time: '1585321743',
  type,
});

const BASIC_REQUEST = {
  connection: {},
  headers: {
    'x-forwarded-for': '63.245.221.32',
  },
};

const BASIC_DATA = {
  flowBeginTime: '1585261624219',
  flowId: '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
  uid: '44794bdf0be84d4e8c7a8026b8580fa3',
};

function createAmplitudeEvent(
  type = '',
  request = BASIC_REQUEST,
  data = BASIC_DATA
) {
  return amplitude({ ...getBasicEvent(type) }, { ...request }, { ...data });
}

registerSuite('amplitude', {
  beforeEach: function () {
    amplitudeConfig.disabled = false;
    amplitudeConfig.rawEvents = false;
    sinon.stub(process.stderr, 'write').callsFake(() => {});
  },

  afterEach: function () {
    process.stderr.write.restore();
    logger.info.resetHistory();
    statsd.increment.resetHistory();
  },

  tests: {
    'app version seems sane': () => {
      assert.typeOf(APP_VERSION, 'string');
      assert.match(APP_VERSION, APP_VERSION_RE);
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
            flowBeginTime: '1585261624219',
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
        version: pkg.version,
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
      sinon.assert.calledThrice(statsd.increment);
      sinon.assert.calledWith(
        statsd.increment.firstCall,
        'amplitude.event.raw'
      );
      sinon.assert.calledWith(statsd.increment.secondCall, 'amplitude.event');
      sinon.assert.calledWith(
        statsd.increment.thirdCall,
        'amplitude.event.dropped'
      );
    },

    'screen.cannot-create-account': () => {
      createAmplitudeEvent('screen.cannot-create-account');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_reg - cannot_create_account_view'
      );
    },

    'screen.cookies-disabled': () => {
      createAmplitudeEvent('screen.cookies-disabled');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - cookies_disabled_view'
      );
    },

    'flow.cookies_disabled.try-again-submit': () => {
      createAmplitudeEvent('flow.cookies-disabled.try-again-submit');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - cookies_disabled_try_again_submit'
      );
    },

    'cookies_disabled.try-again-success': () => {
      createAmplitudeEvent('flow.cookies-disabled.try-again-success');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - cookies_disabled_try_again_success'
      );
    },

    'cookies_disabled.try-again-fail': () => {
      createAmplitudeEvent('flow.cookies-disabled.try-again-fail');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - cookies_disabled_try_again_fail'
      );
    },

    'screen.legal': () => {
      createAmplitudeEvent('screen.legal');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - legal_view'
      );
    },

    'screen.legal-terms': () => {
      createAmplitudeEvent('screen.legal-terms');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - legal_terms_view'
      );
    },

    'flow.legal-terms.back': () => {
      createAmplitudeEvent('flow.legal-terms.back');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - legal_terms_back'
      );
    },

    'screen.legal-privacy': () => {
      createAmplitudeEvent('screen.legal-privacy');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - legal_privacy_view'
      );
    },

    'flow.legal-privacy.back': () => {
      createAmplitudeEvent('flow.legal-privacy.back');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - legal_privacy_back'
      );
    },

    'flow.reset-password.submit': () => {
      amplitude(
        {
          time: '1585321743',
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
          deviceId: 'a5fa745ba71b416cba3eb35acea47233',
          entrypoint: 'baz',
          entrypoint_experiment: 'exp',
          entrypoint_variation: 'var',
          experiments: [
            { choice: 'FirstExperiment', group: 'groupOne' },
            { choice: 'second-experiment', group: 'Group-Two' },
            { choice: 'THIRD_EXPERIMENT', group: 'group_three' },
            { choice: 'fourth.experiment', group: 'Group.FOUR' },
          ],
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'en',
          location: {
            country: 'United States',
            state: 'California',
          },
          service: '1',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
      sinon.assert.calledOnce(statsd.increment);
      sinon.assert.calledWith(statsd.increment.firstCall, 'amplitude.event');
      assert.deepEqual(args[1], {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'a5fa745ba71b416cba3eb35acea47233',
        event_properties: {
          oauth_client_id: '1',
          service: 'pocket',
        },
        event_type: 'fxa_login - forgot_submit',
        language: 'en',
        op: 'amplitudeEvent',
        os_name: 'Mac OS X',
        os_version: '10.11',
        region: 'California',
        session_id: '1585261624219',
        time: '1585321743',
        user_id: '44794bdf0be84d4e8c7a8026b8580fa3',
        user_properties: {
          entrypoint: 'baz',
          entrypoint_experiment: 'exp',
          entrypoint_variation: 'var',
          flow_id:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
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

    'screen.settings.change-password': () => {
      createAmplitudeEvent('screen.settings.change-password');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - change_password_view'
      );
    },

    'settings.change-password.success': () => {
      amplitude(
        {
          time: '1585321743',
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
          deviceId: 'a5fa745ba71b416cba3eb35acea47233',
          entrypoint: 'c',
          experiments: [],
          flowBeginTime: '1585321696',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'gd',
          location: {
            country: 'United Kingdom',
            state: 'Dorset',
          },
          service: 'g',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
        device_id: 'a5fa745ba71b416cba3eb35acea47233',
        device_model: 'iPad',
        event_properties: {
          oauth_client_id: 'g',
          service: 'undefined_oauth',
        },
        event_type: 'fxa_pref - password',
        language: 'gd',
        op: 'amplitudeEvent',
        os_name: 'iOS',
        os_version: '6.0',
        region: 'Dorset',
        session_id: '1585321696',
        time: '1585321743',
        user_id: '44794bdf0be84d4e8c7a8026b8580fa3',
        user_properties: {
          $append: {
            fxa_services_used: 'undefined_oauth',
          },
          entrypoint: 'c',
          flow_id:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
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

    'screen.settings.create-password': () => {
      createAmplitudeEvent('screen.settings.create-password');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - create_password_view'
      );
    },

    'settings.create-password.engage': () => {
      createAmplitudeEvent('settings.create-password.engage');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - create_password_engage'
      );
    },

    'settings.create-password.submit': () => {
      createAmplitudeEvent('settings.create-password.submit');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - create_password_submit'
      );
    },

    'settings.create-password.success': () => {
      createAmplitudeEvent('settings.create-password.success');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - create_password_success'
      );
    },

    'settings.create-password.fail': () => {
      createAmplitudeEvent('settings.create-password.fail');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - create_password_fail'
      );
    },

    'settings.clients.disconnect.submit': () => {
      amplitude(
        {
          time: '1585321743',
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
          lang: 'gd',
          uid: 'f',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'settings.clients.disconnect.submit.suspicious': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'settings.clients.disconnect.submit.suspicious',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'a5fa745ba71b416cba3eb35acea47233',
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'gd',
          uid: 'none',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_pref - disconnect_device');
      assert.equal(arg.event_properties.reason, 'suspicious');
      assert.isUndefined(arg.user_id);
    },

    'settings.clients.disconnect.submit.duplicate': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'settings.clients.disconnect.submit.duplicate',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'a5fa745ba71b416cba3eb35acea47233',
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'gd',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'settings.signout.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_pref - logout');
    },

    'flow.settings.account-recovery.confirm-revoke.submit': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.confirm-revoke.submit'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_confirm_revoke_submit'
      );
    },

    'flow.settings.account-recovery.confirm-revoke.success': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.confirm-revoke.success'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_confirm_revoke_success'
      );
    },

    'flow.settings.account-recovery.confirm-revoke.fail': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.confirm-revoke.fail'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_confirm_revoke_fail'
      );
    },

    'flow.settings.account-recovery.confirm-password.submit': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.confirm-password.submit'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_confirm_password_submit'
      );
    },

    'flow.settings.account-recovery.confirm-password.success': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.confirm-password.success'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_confirm_password_success'
      );
    },

    'flow.settings.account-recovery.confirm-password.fail': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.confirm-password.fail'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_confirm_password_fail'
      );
    },

    'flow.settings.account-recovery.recovery-key.download-option': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.recovery-key.download-option'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_option_download'
      );
    },

    'flow.settings.account-recovery.recovery-key.skip-download': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.recovery-key.skip-download'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_skip_download'
      );
    },

    // TODO remove in FXA-7419, print option not available in new UI
    'flow.settings.account-recovery.recovery-key.print-option': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.recovery-key.print-option'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_option_print'
      );
    },

    'flow.settings.account-recovery.create-hint.submit': () => {
      createAmplitudeEvent('flow.settings.account-recovery.create-hint.submit');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_create_hint_submit'
      );
    },

    'flow.settings.account-recovery.create-hint.success': () => {
      createAmplitudeEvent(
        'flow.settings.account-recovery.create-hint.success'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_create_hint_success'
      );
    },

    'flow.settings.account-recovery.create-hint.fail': () => {
      createAmplitudeEvent('flow.settings.account-recovery.create-hint.fail');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_create_hint_fail'
      );
    },
    'flow.settings.account-recovery.create-hint.skip': () => {
      createAmplitudeEvent('flow.settings.account-recovery.create-hint.skip');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_create_hint_skip'
      );
    },

    'flow.settings.account-recovery.create-key.info': () => {
      createAmplitudeEvent('flow.settings.account-recovery.create-key.info');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_create_key_info'
      );
    },

    'flow.settings.account-recovery.create-key.start': () => {
      createAmplitudeEvent('flow.settings.account-recovery.create-key.start');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_create_key_start'
      );
    },

    'flow.settings.account-recovery.create-key.cancel': () => {
      createAmplitudeEvent('flow.settings.account-recovery.create-key.cancel');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_create_key_cancel'
      );
    },

    'flow.settings.account-recovery.change-key.info': () => {
      createAmplitudeEvent('flow.settings.account-recovery.change-key.info');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_change_key_info'
      );
    },

    'flow.settings.account-recovery.change-key.start': () => {
      createAmplitudeEvent('flow.settings.account-recovery.change-key.start');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_change_key_start'
      );
    },

    'flow.settings.account-recovery.change-key.cancel': () => {
      createAmplitudeEvent('flow.settings.account-recovery.change-key.cancel');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - account_recovery_change_key_cancel'
      );
    },

    'screen.settings.avatar.change': () => {
      createAmplitudeEvent('screen.settings.avatar.change');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - avatar_change_view'
      );
    },

    'avatar.crop.submit.change': () => {
      createAmplitudeEvent('avatar.crop.submit.change');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - avatar_crop_submit_change'
      );
    },

    'screen.settings.delete-account': () => {
      createAmplitudeEvent('screen.settings.delete-account');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - delete_account_view'
      );
    },

    'flow.settings.account-delete.terms-checked.success': () => {
      createAmplitudeEvent(
        'flow.settings.account-delete.terms-checked.success'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - delete_account_terms_checked_success'
      );
    },

    'flow.settings.account-delete.confirm-password.success': () => {
      createAmplitudeEvent(
        'flow.settings.account-delete.confirm-password.success'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - delete_account_confirm_password_success'
      );
    },

    'flow.settings.account-delete.confirm-password.fail': () => {
      createAmplitudeEvent(
        'flow.settings.account-delete.confirm-password.fail'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - delete_account_confirm_password_fail'
      );
    },

    'screen.settings.emails': () => {
      createAmplitudeEvent('screen.settings.emails');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - add_secondary_email_view'
      );
    },

    'settings.emails.submit': () => {
      createAmplitudeEvent('settings.emails.submit');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - add_secondary_email_submit'
      );
    },

    'verify-secondary-email.verification.clicked': () => {
      createAmplitudeEvent('verify-secondary-email.verification.clicked');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - verify_secondary_email_clicked'
      );
    },

    'verify-secondary-email.verification.success': () => {
      createAmplitudeEvent('verify-secondary-email.verification.success');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - verify_secondary_email_success'
      );
    },

    'verify-secondary-email.verification.fail': () => {
      createAmplitudeEvent('verify-secondary-email.verification.fail');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - verify_secondary_email_fail'
      );
    },

    'flow.update-firefox.view': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.update-firefox.view',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.support.view',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.update-firefox.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'experiment.designF.passwordStrength.blocked',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.choose-what-to-sync.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - cwts_engage');
      assert.isUndefined(logger.info.args[0][1].user_properties.sync_engines);
    },

    'flow.enter-email.engage': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.enter-email.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.force-auth.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - engage');
    },

    'flow.signin.engage': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.signin.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - engage');
    },

    'flow.signup.engage': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.signup.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'a5fa745ba71b416cba3eb35acea47233',
          entrypoint: 'c',
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'gd',
          location: {
            country: 'United States',
            state: 'California',
          },
          service: '1234',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
        device_id: 'a5fa745ba71b416cba3eb35acea47233',
        event_properties: {
          oauth_client_id: '1234',
          service: 'undefined_oauth',
        },
        event_type: 'fxa_reg - engage',
        language: 'gd',
        op: 'amplitudeEvent',
        region: 'California',
        session_id: '1585261624219',
        time: '1585321743',
        user_id: '44794bdf0be84d4e8c7a8026b8580fa3',
        user_properties: {
          $append: {
            fxa_services_used: 'undefined_oauth',
          },
          entrypoint: 'c',
          flow_id:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm',
        },
      });
    },

    'flow.reset-password.engage': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.reset-password.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'flow.signin-totp-code.engage': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.signin-totp-code.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.support.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.install_from.foo',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.signin_from.bar',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - view');
      assert.equal(arg.event_properties.connect_device_flow, 'signin');
      assert.equal(arg.event_properties.connect_device_os, undefined);
    },

    'screen.add-recovery-key': () => {
      createAmplitudeEvent('screen.add-recovery-key');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_activity - add_recovery_key_view'
      );
    },

    'flow.connect-another-device.link.app-store.foo': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.connect-another-device.link.app-store.foo',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.choose-what-to-sync.back',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.signin.forgot-password',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - forgot_pwd');
    },

    'flow.signin.have-account': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.signin.have-account',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - have_account');
    },

    'flow.choose-what-to-sync.submit': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.choose-what-to-sync.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          syncEngines: ['wibble', 'blee'],
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.enter-email.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.signin.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - submit');
    },

    'flow.signin.submit': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.signin.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - submit');
    },

    'flow.signup.submit': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.signup.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - submit');
    },

    'flow.signin-totp-code.submit': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.signin-totp-code.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.support.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.wibble.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'screen.choose-what-to-sync': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.choose-what-to-sync',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - cwts_view');
      assert.isUndefined(logger.info.args[0][1].user_properties.sync_engines);
    },

    'screen.enter-email': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.enter-email',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_email_first - view');
    },

    'screen.rp-button': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.rp-button',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_rp_button - view');
    },

    'screen.subscribe': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.subscribe',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_subscribe - view');
    },

    'screen.force-auth': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.force-auth',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - view');
    },

    'screen.signin': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.signin',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_login - view');
    },

    'screen.signup': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.signup',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_reg - view');
    },

    'screen.oauth.signin': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.oauth.signin',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'screen.signin.other_events',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 0);
    },

    'screen.settings': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.settings',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(logger.info.args[0][1].event_type, 'fxa_pref - view');
    },

    'screen.reset-password': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.reset-password',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'screen.signin-totp-code': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'screen.signin-totp-code',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_login - totp_code_view'
      );
    },

    'screen.settings.two-step-authentication': () => {
      createAmplitudeEvent('screen.settings.two-step-authentication');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - two_step_authentication_view'
      );
    },

    'flow.settings.two-step-authentication.submit': () => {
      createAmplitudeEvent('flow.settings.two-step-authentication.submit');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - two_step_authentication_submit'
      );
    },

    'flow.settings.two-step-authentication.download-option': () => {
      createAmplitudeEvent(
        'flow.settings.two-step-authentication.download-option'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - two_step_authentication_recovery_codes_download'
      );
    },

    'flow.settings.two-step-authentication.copy-option': () => {
      createAmplitudeEvent('flow.settings.two-step-authentication.copy-option');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - two_step_authentication_recovery_codes_copy'
      );
    },

    'flow.settings.two-step-authentication.print-option': () => {
      createAmplitudeEvent(
        'flow.settings.two-step-authentication.print-option'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_pref - two_step_authentication_recovery_codes_print'
      );
    },

    'flow.signin-totp-code.success': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'flow.signin-totp-code.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.support.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.support.fail',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'settings.communication-preferences.wibble.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'complete-reset-password.verification.clicked': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'complete-reset-password.verification.clicked',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          deviceId: 'a5fa745ba71b416cba3eb35acea47233',
          emailDomain: 'other',
          entrypoint: 'c',
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'gd',
          location: {
            country: 'United States',
            state: 'California',
          },
          service: 'sync',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
        device_id: 'a5fa745ba71b416cba3eb35acea47233',
        event_properties: {
          email_provider: 'other',
          email_type: 'reset_password',
          service: 'sync',
        },
        event_type: 'fxa_email - click',
        language: 'gd',
        op: 'amplitudeEvent',
        region: 'California',
        session_id: '1585261624219',
        time: '1585321743',
        user_id: '44794bdf0be84d4e8c7a8026b8580fa3',
        user_properties: {
          $append: {
            fxa_services_used: 'sync',
          },
          entrypoint: 'c',
          flow_id:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
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
          time: '1585321743',
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
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_email - click');
      assert.equal(arg.event_properties.email_provider, undefined);
      assert.equal(arg.event_properties.email_type, 'login');
    },

    'screen.reset-password-with-recovery-key-verified': () => {
      createAmplitudeEvent('screen.reset-password-with-recovery-key-verified');
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_login - reset_password_with_recovery_key_verified_view'
      );
    },
    'flow.reset-password-with-recovery-key-verified.generate-new-key': () => {
      createAmplitudeEvent(
        'flow.reset-password-with-recovery-key-verified.generate-new-key'
      );
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_login - reset_password_with_recovery_key_verified_generate_new_key'
      );
    },
    'flow.reset-password-with-recovery-key-verified.continue-to-account':
      () => {
        createAmplitudeEvent(
          'flow.reset-password-with-recovery-key-verified.continue-to-account'
        );
        assert.equal(
          logger.info.args[0][1].event_type,
          'fxa_login - reset_password_with_recovery_key_verified_continue_to_account'
        );
      },
    'verify-email.verification.clicked': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'verify-email.verification.clicked',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'wibble.verification.success',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(logger.info.callCount, 0);
    },

    'cached.signin.success': () => {
      amplitude(
        {
          time: '1585321743',
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
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'gd',
          service: '1',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
        language: 'gd',
        op: 'amplitudeEvent',
        os_name: 'Mac OS X',
        os_version: '10.11',
        session_id: '1585261624219',
        time: '1585321743',
        user_id: '44794bdf0be84d4e8c7a8026b8580fa3',
        user_properties: {
          flow_id:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          ua_browser: 'Firefox',
          ua_version: '65.0',
          $append: {
            fxa_services_used: 'pocket',
          },
        },
      });
    },

    'pairing.signin.success': () => {
      amplitude(
        {
          time: '1585321743',
          type: 'pairing.signin.success',
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
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          lang: 'gd',
          service: '1',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
        event_type: 'fxa_login - complete_pairing',
        language: 'gd',
        op: 'amplitudeEvent',
        os_name: 'Mac OS X',
        os_version: '10.11',
        session_id: '1585261624219',
        time: '1585321743',
        user_id: '44794bdf0be84d4e8c7a8026b8580fa3',
        user_properties: {
          flow_id:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
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
          time: '1585321743',
          type: 'screen.confirm-signup-code',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.confirm-signup-code.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.confirm-signup-code.submit',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'screen.connect-another-device',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
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
          time: '1585321743',
          type: 'flow.rp.engage',
        },
        {
          connection: {},
          headers: {
            'x-forwarded-for': '63.245.221.32',
          },
        },
        {
          flowBeginTime: '1585261624219',
          flowId:
            '11750082326622a61b155a58a54442dd3702fa899b18d62868562ef9a3bc8484',
          service: '2',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_rp - engage');
      assert.equal(arg.event_properties.oauth_client_id, '2');
      assert.equal(arg.event_properties.service, 'fx-monitor');
      assert.equal(arg.time, '1585321743');
      assert.equal(arg.user_id, '44794bdf0be84d4e8c7a8026b8580fa3');
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - pair_view');
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - submit');
      assert.equal(arg.event_properties.connect_device_flow, 'pairing');
    },

    'screen.signup.pair': () => {
      amplitude(
        {
          offset: 31721,
          type: 'screen.signup.pair',
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );

      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_connect_device - pair_view'
      );
    },

    'signup.pair.submit': () => {
      amplitude(
        {
          offset: 31721,
          type: 'signup.pair.submit',
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_connect_device - pair_submit'
      );
    },

    'pair.submit': () => {
      amplitude(
        {
          offset: 31721,
          type: 'signup.pair.submit',
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_connect_device - pair_submit'
      );
    },

    'screen.pair.downloadlink.engage': () => {
      amplitude(
        {
          offset: 31721,
          type: 'screen.pair.downloadlink.engage',
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_connect_device - download_engage'
      );
    },

    'screen.pair.auth.allow': () => {
      amplitude(
        {
          offset: 31721,
          type: 'screen.pair.auth.allow',
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_qr_connect_device - view'
      );
    },

    'flow.pair.auth.allow.submit': () => {
      createAmplitudeEvent('flow.pair.auth.allow.submit');
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_qr_connect_device - submit'
      );
    },

    'screen.pair.auth.wait-for-supp': () => {
      createAmplitudeEvent('screen.pair.auth.wait-for-supp');
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_qr_connect_device - wait_for_supp'
      );
    },

    'screen.pair.auth.complete': () => {
      amplitude(
        {
          offset: 31721,
          type: 'screen.pair.auth.complete',
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_qr_connect_device - complete'
      );
    },

    'screen.pair.auth.fx-view': () => {
      amplitude(
        {
          offset: 31721,
          type: 'screen.pair.auth.fx-view',
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
            '5447c7149042981c04bb47e8c3b717d12cfc9f2e21222b9d2b1837e193eb0d0a',
          uid: '44794bdf0be84d4e8c7a8026b8580fa3',
        }
      );
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_qr_connect_device - fx_view_engage'
      );
    },

    'cad.notnow.engage': () => {
      createAmplitudeEvent('cad.notnow.engage');

      assert.equal(logger.info.callCount, 1);
      const arg = logger.info.args[0][1];
      assert.equal(arg.event_type, 'fxa_connect_device - cad_notnow_engage');
    },

    'screen.pair.notnow.engage': () => {
      createAmplitudeEvent('screen.pair.notnow.engage');
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_connect_device - pair_notnow_engage'
      );
    },

    'flow.brand-messaging-prelaunch-view': () => {
      createAmplitudeEvent('flow.signin.brand-messaging-prelaunch-view');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_branding - signin_brand_messaging_prelaunch_view'
      );
    },
    'flow.brand-messaging-prelaunch-learn-more': () => {
      createAmplitudeEvent('flow.signin.brand-messaging-prelaunch-learn-more');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_branding - signin_brand_messaging_prelaunch_learn_more'
      );
    },
    'flow.brand-messaging-prelaunch-banner-close': () => {
      createAmplitudeEvent(
        'flow.signin.brand-messaging-prelaunch-banner-close'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_branding - signin_brand_messaging_prelaunch_banner_close'
      );
    },
    'flow.brand-messaging-postlaunch-view': () => {
      createAmplitudeEvent('flow.signin.brand-messaging-postlaunch-view');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_branding - signin_brand_messaging_postlaunch_view'
      );
    },
    'flow.brand-messaging-postlaunch-learn-more': () => {
      createAmplitudeEvent('flow.signin.brand-messaging-postlaunch-learn-more');

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_branding - signin_brand_messaging_postlaunch_learn_more'
      );
    },
    'flow.brand-messaging-postlaunch-banner-close': () => {
      createAmplitudeEvent(
        'flow.signin.brand-messaging-postlaunch-banner-close'
      );

      assert.equal(logger.info.callCount, 1);
      assert.equal(
        logger.info.args[0][1].event_type,
        'fxa_branding - signin_brand_messaging_postlaunch_banner_close'
      );
    },
  },
});
