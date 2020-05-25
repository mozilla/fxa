/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import ConfigLoader from 'lib/config-loader';
import Constants from 'lib/constants';
const ConfigLoaderErrors = ConfigLoader.Errors;
import sinon from 'sinon';

const INVALID_JSON_HTML_CONFIG = encodeURIComponent('{a');
const INVALID_URI_COMPONENT_HTML_CONFIG =
  'Coast%20Guard%20Academy%20to%20hold%20annual%20Women%92s%20%91Leadhership%92%20event';
const VALID_HTML_CONFIG = encodeURIComponent(JSON.stringify({ env: 'dev' }));

const FEATURE_FLAGS = {
  communicationPrefLanguages: ['en', 'fr'],
  metricsSampleRate: 0.1,
  sentrySampleRate: 1,
  smsCountries: {
    FR: {
      rolloutRate: 0.5,
    },
    GB: {
      rolloutRate: 1,
    },
  },
  tokenCodeClients: {
    deadbeefbaadf00d: {
      rolloutRate: 0,
    },
    sync: {
      rolloutRate: 1,
    },
  },
};
const SERIALISED_FEATURE_FLAGS = encodeURIComponent(
  JSON.stringify(FEATURE_FLAGS)
);

describe('lib/config-loader', () => {
  let configLoader;

  before(() => {
    configLoader = new ConfigLoader();
  });

  it('_readConfigFromHTML returns a `MISSING_CONFIG` error', () => {
    return configLoader._readConfigFromHTML().then(assert.fail, (err) => {
      assert.isTrue(ConfigLoaderErrors.is(err, 'MISSING_CONFIG'));
    });
  });

  it('_parseHTMLConfig rejects with invalid encoding', () => {
    return configLoader
      ._parseHTMLConfig(INVALID_URI_COMPONENT_HTML_CONFIG)
      .then(assert.fail, (err) => {
        assert.isTrue(ConfigLoaderErrors.is(err, 'INVALID_CONFIG'));
      });
  });

  it('_parseHTMLConfig rejects with invalid JSON', () => {
    return configLoader
      ._parseHTMLConfig(INVALID_JSON_HTML_CONFIG)
      .then(assert.fail, (err) => {
        assert.isTrue(ConfigLoaderErrors.is(err, 'INVALID_CONFIG'));
      });
  });

  describe('insert config markup in to the DOM', () => {
    before(() => {
      $('head').append(
        `<meta name="fxa-content-server/config" content="${VALID_HTML_CONFIG}" />`
      );
      $('head').append(
        `<meta name="fxa-feature-flags" content="${SERIALISED_FEATURE_FLAGS}" />`
      );
    });

    after(() => {
      $('meta[name="fxa-content-server/config"]').remove();
      $('meta[name="fxa-feature-flags"]').remove();
    });

    it('_readConfigFromHTML returns the expected config', () => {
      return configLoader._readConfigFromHTML().then((serializedHTMLConfig) => {
        assert.equal(serializedHTMLConfig, VALID_HTML_CONFIG);
      });
    });

    it('_parseHTMLConfig parses the config', () => {
      return configLoader._parseHTMLConfig(VALID_HTML_CONFIG).then((config) => {
        assert.equal(config.env, 'dev');
        assert.deepEqual(config.featureFlags, FEATURE_FLAGS);
      });
    });

    it('_setWebpackPublicPath sets the bundle path', () => {
      configLoader._setWebpackPublicPath('somepath');
      assert.equal(__webpack_public_path__, 'somepath'); //eslint-disable-line no-undef
      configLoader._setWebpackPublicPath();
      assert.equal(__webpack_public_path__, Constants.DEFAULT_BUNDLE_PATH); //eslint-disable-line no-undef
    });

    describe('mock internal methods', () => {
      let $html;
      let origLang;
      let sandbox;

      beforeEach(() => {
        $html = $('html');
        origLang = $html.attr('lang');
        $html.attr('lang', 'db_LB');

        sandbox = sinon.sandbox;
        sandbox.spy(configLoader, '_readConfigFromHTML');
        sandbox.spy(configLoader, '_parseHTMLConfig');
      });

      afterEach(() => {
        $html.attr('lang', origLang);

        sandbox.restore();
      });

      it('fetch returns the config', () => {
        return configLoader.fetch().then((config) => {
          assert.equal(config.env, 'dev');
          assert.equal(config.lang, 'db_LB');
          assert.deepEqual(config.featureFlags, FEATURE_FLAGS);

          assert.isTrue(configLoader._readConfigFromHTML.called);
          assert.isTrue(configLoader._parseHTMLConfig.called);
        });
      });
    });
  });
});
