/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable camelcase */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon',
  'intern/dojo/node!../../package.json',
], (registerSuite, assert, path, proxyquire, sinon, package) => {
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
  const APP_VERSION = /^[0-9]+\.([0-9]+)\./.exec(package.version)[1];

  registerSuite({
    name: 'amplitude',

    beforeEach () {
      sinon.stub(process.stderr, 'write', () => {});
    },

    afterEach () {
      process.stderr.write.restore();
    },

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
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:58.0) Gecko/20100101 Firefox/58.0'
        }
      }, {
        deviceId: 'bar',
        entrypoint: 'baz',
        experiments: [
          { choice: 'FirstExperiment', group: 'groupOne' },
          { choice: 'second-experiment', group: 'Group-Two' },
          { choice: 'THIRD_EXPERIMENT', group: 'group_three' },
          { choice: 'fourth.experiment', group: 'Group.FOUR' }
        ],
        flowBeginTime: 'qux',
        flowId: 'wibble',
        lang: 'blee',
        service: '0',
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
        device_id: 'bar',
        event_properties: {
          device_id: 'bar',
          entrypoint: 'baz',
          service: 'amo'
        },
        event_type: 'fxa_login - forgot_submit',
        language: 'blee',
        op: 'amplitudeEvent',
        os_name: 'Mac OS X',
        os_version: '10.11',
        session_id: 'qux',
        time: 'foo',
        user_id: 'soop',
        user_properties: {
          experiments: [
            'first_experiment_group_one',
            'second_experiment_group_two',
            'third_experiment_group_three',
            'fourth_experiment_group_four'
          ],
          flow_id: 'wibble',
          ua_browser: 'Firefox',
          ua_version: '58',
          utm_campaign: 'melm',
          utm_content: 'florg',
          utm_medium: 'derp',
          utm_source: 'bnag',
          utm_term: 'plin'
        }
      });
    },

    'settings.change-password.success': () => {
      amplitude({
        time: 'a',
        type: 'settings.change-password.success'
      }, {
        headers: {
          'user-agent': 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A406 Safari/8536.25'
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
        device_id: 'b',
        device_model: 'iPad',
        event_properties: {
          device_id: 'b',
          entrypoint: 'c'
        },
        event_type: 'fxa_pref - password',
        language: 'f',
        op: 'amplitudeEvent',
        os_name: 'iOS',
        os_version: '6',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          flow_id: 'e',
          ua_browser: 'Mobile Safari',
          ua_version: '6'
        }
      });
    },

    'settings.clients.disconnect.submit': () => {
      amplitude({
        time: 'a',
        type: 'settings.clients.disconnect.submit'
      }, {
        headers: {}
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
      assert.isUndefined(arg.device_id);
      assert.isUndefined(arg.event_properties.device_id);
      assert.isUndefined(arg.user_id);
    },

    'settings.signout.success': () => {
      amplitude({
        time: 'a',
        type: 'settings.signout.success'
      }, {
        headers: {}
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_pref - logout');
    },

    'flow.force-auth.engage': () => {
      amplitude({
        time: 'a',
        type: 'flow.force-auth.engage'
      }, {
        headers: {}
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
        headers: {}
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
        headers: {}
      }, {
        deviceId: 'b',
        entrypoint: 'c',
        flowBeginTime: 'd',
        flowId: 'e',
        lang: 'f',
        service: '1',
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
        device_id: 'b',
        event_properties: {
          device_id: 'b',
          entrypoint: 'c',
          service: 'pocket'
        },
        event_type: 'fxa_reg - engage',
        language: 'f',
        op: 'amplitudeEvent',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          flow_id: 'e',
          utm_campaign: 'i',
          utm_content: 'j',
          utm_medium: 'k',
          utm_source: 'l',
          utm_term: 'm'
        }
      });
    },

    'flow.reset-password.engage': () => {
      amplitude({
        time: 'a',
        type: 'flow.reset-password.engage'
      }, {
        headers: {}
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    },

    'flow.signin.forgot-password': () => {
      amplitude({
        time: 'a',
        type: 'flow.signin.forgot-password'
      }, {
        headers: {}
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
        headers: {}
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_reg - have_account');
    },

    'flow.force-auth.submit': () => {
      amplitude({
        time: 'a',
        type: 'flow.signin.submit'
      }, {
        headers: {}
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
        headers: {}
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
        headers: {}
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 1);
      const arg = JSON.parse(process.stderr.write.args[0]);
      assert.equal(arg.event_type, 'fxa_reg - submit');
    },

    'flow.wibble.submit': () => {
      amplitude({
        time: 'a',
        type: 'flow.wibble.submit'
      }, {
        headers: {}
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    },

    'screen.force-auth': () => {
      amplitude({
        time: 'a',
        type: 'screen.force-auth'
      }, {
        headers: {}
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
        headers: {}
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
        headers: {}
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
        headers: {}
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
        headers: {}
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
        device_id: 'b',
        event_properties: {
          device_id: 'b'
        },
        event_type: 'fxa_sms - view',
        language: 'f',
        op: 'amplitudeEvent',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          flow_id: 'e'
        }
      });
    },

    'screen.reset-password': () => {
      amplitude({
        time: 'a',
        type: 'screen.reset-password'
      }, {
        headers: {}
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
        headers: {}
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
        headers: {}
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
        headers: {}
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    },

    'complete-reset-password.verification.success': () => {
      amplitude({
        time: 'a',
        type: 'complete-reset-password.verification.success'
      }, {
        headers: {}
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
        device_id: 'b',
        event_properties: {
          device_id: 'b',
          email_type: 'reset_password',
          service: 'g'
        },
        event_type: 'fxa_email - click',
        language: 'f',
        op: 'amplitudeEvent',
        session_id: 'd',
        time: 'a',
        user_id: 'h',
        user_properties: {
          flow_id: 'e'
        }
      });
    },

    'complete-signin.verification.success': () => {
      amplitude({
        time: 'a',
        type: 'complete-signin.verification.success'
      }, {
        headers: {}
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

    'verify-email.verification.success': () => {
      amplitude({
        time: 'a',
        type: 'verify-email.verification.success'
      }, {
        headers: {}
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
        headers: {}
      }, {
        flowBeginTime: 'b',
        flowId: 'c',
        uid: 'd'
      });
      assert.equal(process.stderr.write.callCount, 0);
    }
  });
});

