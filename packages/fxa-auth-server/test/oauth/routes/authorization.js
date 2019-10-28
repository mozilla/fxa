/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Joi = require('joi');

const routeModulePath = '../../../lib/oauth/routes/authorization';

const CLIENT_ID = '98e6508e88680e1b';
// jscs:disable
const BASE64URL_STRING =
  'TG9yZW0gSXBzdW0gaXMgc2ltcGx5IGR1bW15IHRleHQgb2YgdGhlIHByaW50aW5nIGFuZCB0eXBlc2V0dGluZyBpbmR1c3RyeS4gTG9yZW0gSXBzdW0gaGFzIGJlZW4gdGhlIGluZHVzdHJ5J3Mgc3RhbmRhcmQgZHVtbXkgdGV4dCBldmVyIHNpbmNlIHRoZSAxNTAwcywgd2hlbiBhbiB1bmtub3duIHByaW50ZXIgdG9vayBhIGdhbGxleSBvZiB0eXBlIGFuZCBzY3JhbWJsZWQgaXQgdG8gbWFrZSBhIHR5cGUgc3BlY2ltZW4gYm9v';
// jscs:enable
const PKCE_CODE_CHALLENGE = 'iyW5ScKr22v_QL-rcW_EGlJrDSOymJvrlXlw4j7JBiQ';
const PKCE_CODE_CHALLENGE_METHOD = 'S256';
const DISABLED_CLIENT_ID = 'd15ab1edd15ab1ed';

describe('/authorization POST', function() {
  describe('input validation', () => {
    const route = require(routeModulePath);
    const validation = route.validate.payload;

    function joiAssertFail(req, param, messagePostfix) {
      messagePostfix = messagePostfix || 'is required';
      let fail = null;

      try {
        Joi.assert(req, validation);
      } catch (err) {
        fail = true;
        assert.ok(err.isJoi);
        assert.ok(err.name, 'ValidationError');
        assert.equal(err.details[0].message, `"${param}" ${messagePostfix}`);
      }

      if (!fail) {
        throw new Error('Did not throw!');
      }
    }

    it('fails with no client_id', () => {
      joiAssertFail(
        {
          foo: 1,
        },
        'client_id'
      );
    });

    it('fails with no assertion', () => {
      joiAssertFail(
        {
          client_id: CLIENT_ID,
        },
        'assertion'
      );
    });

    it('fails with no scope', () => {
      joiAssertFail(
        {
          client_id: CLIENT_ID,
          assertion: BASE64URL_STRING,
        },
        'scope'
      );
    });

    it('fails with no state', () => {
      joiAssertFail(
        {
          client_id: CLIENT_ID,
          assertion: BASE64URL_STRING,
          scope: 'bar',
        },
        'state'
      );
    });

    it('accepts state parameter', () => {
      Joi.assert(
        {
          client_id: CLIENT_ID,
          assertion: BASE64URL_STRING,
          scope: 'bar',
          state: 'foo',
        },
        validation
      );
    });

    describe('PKCE params', function() {
      it('accepts code_challenge and code_challenge_method', () => {
        Joi.assert(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: PKCE_CODE_CHALLENGE,
            code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
          },
          validation
        );
      });

      it('validates code_challenge_method', () => {
        joiAssertFail(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: PKCE_CODE_CHALLENGE,
            code_challenge_method: 'bad_method',
          },
          'code_challenge_method',
          'must be one of [S256]'
        );
      });

      it('validates code_challenge', () => {
        joiAssertFail(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: 'foo',
            code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
          },
          'code_challenge',
          'length must be 43 characters long'
        );
      });

      it('works with response_type code (non-default)', () => {
        Joi.assert(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: PKCE_CODE_CHALLENGE,
            code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
            response_type: 'code',
          },
          validation
        );
      });

      it('fails with response_type token', () => {
        joiAssertFail(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: PKCE_CODE_CHALLENGE,
            code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
            response_type: 'token',
          },
          'code_challenge',
          'is not allowed'
        );
      });
    });
  });

  describe('config handling', () => {
    const route = require(routeModulePath);

    const request = {
      headers: {},
      payload: {
        client_id: CLIENT_ID,
      },
    };

    it('allows clients that have not been disabled via config', async () => {
      try {
        await route.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.errno, 104); // Invalid assertion.
      }
    });

    it('returns an error for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      try {
        await route.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.output.statusCode, 503);
        assert.equal(err.errno, 202); // Disabled client
      }
    });
  });
});
