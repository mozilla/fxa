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
const amplitude = proxyquire(path.resolve('server/lib/amplitude'), {
  './configuration': {
    get () {
      return {
        '0': 'amo',
        '1': 'pocket'
      };
    }
  }
});
const APP_VERSION = /^[0-9]+\.([0-9]+)\./.exec(pkg.version)[1];

registerSuite('amplitude', {
  beforeEach: function() {
    sinon.stub(process.stderr, 'write').callsFake(() => {});
  },

  afterEach: function() {
    process.stderr.write.restore();
  },

  tests: {
    /*eslint-disable sorting/sort-object-props */
    'app version seems sane': () => {
      assert.typeOf(APP_VERSION, 'string');
      assert.match(APP_VERSION, /^[0-9]+$/);
    },

    'interface is correct': () => {
      assert.isFunction(amplitude);
      assert.lengthOf(amplitude, 3);
    },

    'does not throw if arguments are missing': () => {
      assert.doesNotThrow(amplitude);
      assert.doesNotThrow(() => amplitude('foo'));
      assert.doesNotThrow(() => amplitude(null, {}));
    },

    'flow.reset-password.submit': () => {
      amplitude({
        time: 'foo',
        type: 'flow.reset-password.submit'
      }, {
        connection: {},
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:58.0) Gecko/20100101 Firefox/58.0',
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        deviceId: 'bar',
        entrypoint: 'baz',
        experiments: [
          {choice: 'FirstExperiment', group: 'groupOne'},
          {choice: 'second-experiment', group: 'Group-Two'},
          {choice: 'THIRD_EXPERIMENT', group: 'group_three'},
          {choice: 'fourth.experiment', group: 'Group.FOUR'}
        ],
        flowBeginTime: 'qux',
        flowId: 'wibble',
        lang: 'blee',
        service: '1',
        uid: 'soop',
        utm_campaign: 'melm',
        utm_content: 'florg',
        utm_medium: 'derp',
        utm_source: 'bnag',
        utm_term: 'plin'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const args = process.stderr.write.args[0];
      assert.lengthOf(args, 1);
      assert.typeOf(args[0], 'string');
      assert.equal(args[0][args[0].length - 1], '\n');
      assert.deepEqual(JSON.parse(args[0]), {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'bar',
        event_properties: {
          device_id: 'bar',
          oauth_client_id: '1',
          service: 'pocket'
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
          flow_id: 'wibble',
          ua_browser: 'Firefox',
          ua_version: '58.0',
          utm_campaign: 'melm',
          utm_content: 'florg',
          utm_medium: 'derp',
          utm_source: 'bnag',
          utm_term: 'plin',
          '$append': {
            experiments: [
              'first_experiment_group_one',
              'second_experiment_group_two',
              'third_experiment_group_three',
              'fourth_experiment_group_four'
            ]
          }
        }
      });
    },

    'settings.change-password.success': () => {
      amplitude({
        time: 'a',
        type: 'settings.change-password.success'
      }, {
        connection: {},
        headers: {
          'user-agent': 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A406 Safari/8536.25',
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        deviceId: 'b',
        entrypoint: 'c',
        experiments: [],
        flowBeginTime: 'd',
        flowId: 'e',
        lang: 'f',
        service: 'g',
        uid: 'h',
        utm_campaign: 'i',
        utm_content: 'j',
        utm_medium: 'k',
        utm_source: 'l',
        utm_term: 'm'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.deepEqual(arg, {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'b',
        device_model: 'iPad',
        event_properties: {
          device_id: 'b'
        },
        event_type: 'fxa_pref - password',
        language: 'f',
        op: 'amplitudeEvent',
        os_name: 'iOS',
        os_version: '6.0',
        region: 'California',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          entrypoint: 'c',
          ua_browser: 'Mobile Safari',
          ua_version: '6.0'
        }
      });
    },

    'settings.clients.disconnect.submit': () => {
      amplitude({
        time: 'a',
        type: 'settings.clients.disconnect.submit'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        deviceId: 'b',
        flowBeginTime: 'c',
        flowId: 'd',
        lang: 'e',
        uid: 'f'
      });
      assert.equal(process.stderr.write.callCount, 0);
    },

    'settings.clients.disconnect.submit.suspicious': () => {
      amplitude({
        time: 'a',
        type: 'settings.clients.disconnect.submit.suspicious'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        deviceId: 'none',
        flowBeginTime: 'b',
        flowId: 'c',
        lang: 'd',
        uid: 'none'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_pref - disconnect_device');
      assert.equal(arg.event_properties.reason, 'suspicious');
      assert.isUndefined(arg.device_id);
      assert.isUndefined(arg.event_properties.device_id);
      assert.isUndefined(arg.user_id);
    },

    'settings.clients.disconnect.submit.duplicate': () => {
      amplitude({
        time: 'a',
        type: 'settings.clients.disconnect.submit.duplicate'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        deviceId: 'b',
        flowBeginTime: 'c',
        flowId: 'd',
        lang: 'e',
        uid: 'f'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_pref - disconnect_device');
      assert.equal(arg.event_properties.reason, 'duplicate');
    },

    'settings.signout.success': () => {
      amplitude({
        time: 'a',
        type: 'settings.signout.success'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_pref - logout');
    },

    'flow.enter-email.engage': () => {
      amplitude({
        time: 'a',
        type: 'flow.enter-email.engage'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_email_first - engage');
    },

    'flow.force-auth.engage': () => {
      amplitude({
        time: 'a',
        type: 'flow.force-auth.engage'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_login - engage');
    },

    'flow.signin.engage': () => {
      amplitude({
        time: 'a',
        type: 'flow.signin.engage'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_login - engage');
    },

    'flow.signup.engage': () => {
      amplitude({
        time: 'a',
        type: 'flow.signup.engage'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        deviceId: 'b',
        entrypoint: 'c',
        flowBeginTime: 'd',
        flowId: 'e',
        lang: 'f',
        service: '2',
        uid: 'h',
        utm_campaign: 'i',
        utm_content: 'j',
        utm_medium: 'k',
        utm_source: 'l',
        utm_term: 'm'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_reg - engage');
      assert.deepEqual(arg, {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'b',
        event_properties: {
          device_id: 'b',
          oauth_client_id: '2',
          service: 'undefined_oauth'
        },
        event_type: 'fxa_reg - engage',
        language: 'f',
        op: 'amplitudeEvent',
        region: 'California',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          entrypoint: 'c',
          flow_id: 'e',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm'
        }
      });
    },

    'flow.sms.engage': () => {
      amplitude({
        time: 'a',
        type: 'flow.sms.engage'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_connect_device - engage');
      assert.equal(arg.event_properties.connect_device_flow, 'sms');
    },

    'flow.reset-password.engage': () => {
      amplitude({
        time: 'a',
        type: 'flow.reset-password.engage'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    },

    'flow.install_from.foo': () => {
      amplitude({
        time: 'a',
        type: 'flow.install_from.foo'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_connect_device - engage');
      assert.equal(arg.event_properties.connect_device_flow, 'store_buttons');
    },

    'flow.signin_from.bar': () => {
      amplitude({
        time: 'a',
        type: 'flow.signin_from.bar'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_connect_device - engage');
      assert.equal(arg.event_properties.connect_device_flow, 'signin');
    },

    'flow.signin.forgot-password': () => {
      amplitude({
        time: 'a',
        type: 'flow.signin.forgot-password'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_login - forgot_pwd');
    },

    'flow.signin.have-account': () => {
      amplitude({
        time: 'a',
        type: 'flow.signin.have-account'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_reg - have_account');
    },

    'flow.enter-email.submit': () => {
      amplitude({
        time: 'a',
        type: 'flow.enter-email.submit'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_email_first - submit');
    },

    'flow.force-auth.submit': () => {
      amplitude({
        time: 'a',
        type: 'flow.signin.submit'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_login - submit');
    },

    'flow.signin.submit': () => {
      amplitude({
        time: 'a',
        type: 'flow.signin.submit'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_login - submit');
    },

    'flow.signup.submit': () => {
      amplitude({
        time: 'a',
        type: 'flow.signup.submit'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_reg - submit');
    },

    'flow.sms.submit': () => {
      amplitude({
        time: 'a',
        type: 'flow.sms.submit'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_connect_device - submit');
      assert.equal(arg.event_properties.connect_device_flow, 'sms');
    },

    'flow.wibble.submit': () => {
      amplitude({
        time: 'a',
        type: 'flow.wibble.submit'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    },

    'screen.enter-email': () => {
      amplitude({
        time: 'a',
        type: 'screen.enter-email'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_email_first - view');
    },

    'screen.force-auth': () => {
      amplitude({
        time: 'a',
        type: 'screen.force-auth'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_login - view');
    },

    'screen.signin': () => {
      amplitude({
        time: 'a',
        type: 'screen.signin'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_login - view');
    },

    'screen.signup': () => {
      amplitude({
        time: 'a',
        type: 'screen.signup'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_reg - view');
    },

    'screen.settings': () => {
      amplitude({
        time: 'a',
        type: 'screen.settings'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_pref - view');
    },

    'screen.sms': () => {
      amplitude({
        time: 'a',
        type: 'screen.sms'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        deviceId: 'b',
        entrypoint: 'c',
        flowBeginTime: 'd',
        flowId: 'e',
        lang: 'f',
        service: 'g',
        uid: 'h',
        utm_campaign: 'i',
        utm_content: 'j',
        utm_medium: 'k',
        utm_source: 'l',
        utm_term: 'm'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.deepEqual(arg, {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'b',
        event_properties: {
          connect_device_flow: 'sms',
          device_id: 'b'
        },
        event_type: 'fxa_connect_device - view',
        language: 'f',
        op: 'amplitudeEvent',
        region: 'California',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          entrypoint: 'c',
          flow_id: 'e'
        }
      });
    },

    'screen.connect-another-device': () => {
      amplitude({
        time: 'a',
        type: 'screen.connect-another-device'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_connect_device - view');
      assert.equal(arg.event_properties.connect_device_flow, 'cad');
    },

    'screen.reset-password': () => {
      amplitude({
        time: 'a',
        type: 'screen.reset-password'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    },

    'settings.communication-preferences.optIn.success': () => {
      amplitude({
        time: 'a',
        type: 'settings.communication-preferences.optIn.success'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_pref - newsletter');
      assert.equal(arg.user_properties.newsletter_state, 'subscribed');
    },

    'settings.communication-preferences.optOut.success': () => {
      amplitude({
        time: 'a',
        type: 'settings.communication-preferences.optOut.success'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_pref - newsletter');
      assert.equal(arg.user_properties.newsletter_state, 'unsubscribed');
    },

    'settings.communication-preferences.wibble.success': () => {
      amplitude({
        time: 'a',
        type: 'settings.communication-preferences.wibble.success'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    },

    'complete-reset-password.verification.clicked': () => {
      amplitude({
        time: 'a',
        type: 'complete-reset-password.verification.clicked'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        deviceId: 'b',
        entrypoint: 'c',
        flowBeginTime: 'd',
        flowId: 'e',
        lang: 'f',
        service: 'sync',
        uid: 'h',
        utm_campaign: 'i',
        utm_content: 'j',
        utm_medium: 'k',
        utm_source: 'l',
        utm_term: 'm'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.deepEqual(arg, {
        app_version: APP_VERSION,
        country: 'United States',
        device_id: 'b',
        event_properties: {
          device_id: 'b',
          email_type: 'reset_password',
          service: 'sync'
        },
        event_type: 'fxa_email - click',
        language: 'f',
        op: 'amplitudeEvent',
        region: 'California',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          entrypoint: 'c',
          flow_id: 'e'
        }
      });
    },

    'complete-signin.verification.clicked': () => {
      amplitude({
        time: 'a',
        type: 'complete-signin.verification.clicked'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_email - click');
      assert.equal(arg.event_properties.email_type, 'login');
    },

    'verify-email.verification.clicked': () => {
      amplitude({
        time: 'a',
        type: 'verify-email.verification.clicked'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });

      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_email - click');
      assert.equal(arg.event_properties.email_type, 'registration');
    },

    'wibble.verification.success': () => {
      amplitude({
        time: 'a',
        type: 'wibble.verification.success'
      }, {
        connection: {},
        headers: {
          'x-forwarded-for': '63.245.221.32'
        }
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    }
  }
});
