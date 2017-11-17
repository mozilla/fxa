/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const ConfigLoader = require('lib/config-loader');
  const ConfigLoaderErrors = ConfigLoader.Errors;
  const sinon = require('sinon');

  const INVALID_JSON_HTML_CONFIG = encodeURIComponent('{a');
  const INVALID_URI_COMPONENT_HTML_CONFIG =
    'Coast%20Guard%20Academy%20to%20hold%20annual%20Women%92s%20%91Leadhership%92%20event';
  const VALID_HTML_CONFIG =
    encodeURIComponent(JSON.stringify({ env: 'dev' }));


  describe('lib/config-loader', () => {
    let configLoader;

    before(() => {
      configLoader = new ConfigLoader();
    });

    describe('_readConfigFromHTML', () => {
      describe('config missing', () => {
        it('returns a `MISSING_CONFIG` error', () => {
          return configLoader._readConfigFromHTML()
            .then(assert.fail, (err) => {
              assert.isTrue(ConfigLoaderErrors.is(err, 'MISSING_CONFIG'));
            });
        });
      });

      describe('config available', () => {
        beforeEach(() => {
          $('head').append(`<meta name="fxa-content-server/config" content="${VALID_HTML_CONFIG}" />`);
        });

        afterEach(() => {
          $('meta[name="fxa-content-server/config"]').remove();
        });

        it('returns the expected config', () => {
          return configLoader._readConfigFromHTML()
            .then((serializedHTMLConfig) => {
              assert.equal(serializedHTMLConfig, VALID_HTML_CONFIG);
            });
        });
      });
    });

    describe('_parseHTMLConfig', () => {
      describe('with an invalid URI Component', () => {
        it('throws an `INVALID_CONFIG` error', () => {
          return configLoader._parseHTMLConfig(INVALID_URI_COMPONENT_HTML_CONFIG)
            .then(assert.fail, (err) => {
              assert.isTrue(ConfigLoaderErrors.is(err, 'INVALID_CONFIG'));
            });
        });
      });

      describe('with invalid JSON', () => {
        it('throws an `INVALID_CONFIG` error', () => {
          return configLoader._parseHTMLConfig(INVALID_JSON_HTML_CONFIG)
            .then(assert.fail, (err) => {
              assert.isTrue(ConfigLoaderErrors.is(err, 'INVALID_CONFIG'));
            });
        });
      });

      describe('with valid config', () => {
        it('parses the config', () => {
          return configLoader._parseHTMLConfig(VALID_HTML_CONFIG)
            .then((config) => {
              assert.equal(config.env, 'dev');
            });
        });
      });
    });

    describe('fetch', () => {
      describe('with valid config', () => {
        let $html;
        let origLang;
        let sandbox;

        beforeEach(() => {
          $('head').append(`<meta name="fxa-content-server/config" content="${VALID_HTML_CONFIG}" />`);

          $html = $('html');
          origLang = $html.attr('lang');
          $html.attr('lang', 'db_LB');

          sandbox = sinon.sandbox;
          sandbox.spy(configLoader, '_readConfigFromHTML');
          sandbox.spy(configLoader, '_parseHTMLConfig');
        });

        afterEach(() => {
          $('meta[name="fxa-content-server/config"]').remove();
          $html.attr('lang', origLang);

          sandbox.restore();
        });

        it('returns the config', () => {
          return configLoader.fetch()
            .then((config) => {
              assert.equal(config.env, 'dev');
              assert.equal(config.lang, 'db_LB');

              assert.isTrue(configLoader._readConfigFromHTML.called);
              assert.isTrue(configLoader._parseHTMLConfig.called);
            });
        });
      });
    });

  });
});


