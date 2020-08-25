/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const Joi = require('@hapi/joi');

const routeModulePath = '../../../lib/oauth/routes/token';

const CLIENT_SECRET =
  'b93ef8a8f3e553a430d7e5b904c6132b2722633af9f03128029201d24a97f2a8';
const CLIENT_ID = '98e6508e88680e1b';
const CODE = 'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';
const REFRESH_TOKEN = CODE;
const PKCE_CODE_VERIFIER = 'au3dqDz2dOB0_vSikXCUf4S8Gc-37dL-F7sGxtxpR3R';
const DISABLED_CLIENT_ID = 'd15ab1edd15ab1ed';
const NON_DISABLED_CLIENT_ID = '98e6508e88680e1a';

const route = require(routeModulePath);

function joiRequired(err, param) {
  assert.ok(err.isJoi);
  assert.ok(err.name, 'ValidationError');
  assert.equal(err.details[0].message, `"${param}" is required`);
}

function joiNotAllowed(err, param) {
  assert.ok(err.isJoi);
  assert.ok(err.name, 'ValidationError');
  assert.equal(err.details[0].message, `"${param}" is not allowed`);
}

describe('/token POST', function () {
  describe('input validation', () => {
    // route validation function
    function v(req, ctx, cb) {
      if (typeof ctx === 'function' && !cb) {
        cb = ctx;
        ctx = undefined;
      }
      Joi.validate(req, route.validate.payload, { context: ctx }, cb);
    }

    it('fails with no client_id', (done) => {
      v(
        {
          client_secret: CLIENT_SECRET,
          code: CODE,
        },
        (err) => {
          joiRequired(err, 'client_id');
          done();
        }
      );
    });

    it('valid client_secret scheme', (done) => {
      v(
        {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: CODE,
        },
        (err) => {
          assert.equal(err, null);
          done();
        }
      );
    });

    it('requires client_secret', (done) => {
      v(
        {
          client_id: CLIENT_ID,
          code: CODE,
        },
        (err) => {
          joiRequired(err, 'client_secret');
          done();
        }
      );
    });

    it('forbids client_id when authz header provided', (done) => {
      v(
        {
          client_id: CLIENT_ID,
        },
        {
          headers: {
            authorization: 'Basic ABCDEF',
          },
        },
        (err) => {
          joiNotAllowed(err, 'client_id');
          done();
        }
      );
    });

    it('forbids client_secret when authz header provided', (done) => {
      v(
        {
          client_secret: CLIENT_SECRET,
          code: CODE, // If we don't send `code`, then the missing `code` will fail validation first.
        },
        {
          headers: {
            authorization: 'Basic ABCDEF',
          },
        },
        (err) => {
          joiNotAllowed(err, 'client_secret');
          done();
        }
      );
    });

    describe('refresh_token grants', () => {
      it('accepts a valid refresh_token request', (done) => {
        v(
          {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
          },
          (err) => {
            assert.equal(err, null);
            done();
          }
        );
      });

      it('allows TTL of 6 hours for a refresh_token request', (done) => {
        v(
          {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
            ttl: 60 * 60 * 6, // 6 hours
          },
          (err) => {
            assert.equal(err, null);
            done();
          }
        );
      });

      it('allows TTL of 6 hours for a profile scope refresh_token request', (done) => {
        const PPID_SEED = Math.floor(Math.random() * 1024);
        const PROFILE_URL = 'https://profile.accounts.firefox.com/v1/profile';
        v(
          {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
            ttl: 60 * 60 * 6, // 6 hours
            scope: 'profile',
            ppid_seed: PPID_SEED,
            resource: PROFILE_URL,
          },
          (err) => {
            assert.equal(err, null);
            done();
          }
        );
      });
    });

    describe('pkce', () => {
      it('accepts pkce code_verifier instead of client_secret', (done) => {
        v(
          {
            client_id: CLIENT_ID,
            code_verifier: PKCE_CODE_VERIFIER,
            code: CODE,
          },
          (err) => {
            assert.equal(err, null);
            done();
          }
        );
      });

      it('rejects pkce code_verifier that is too small', (done) => {
        const bad_code_verifier = PKCE_CODE_VERIFIER.substring(0, 32);
        v(
          {
            client_id: CLIENT_ID,
            code_verifier: bad_code_verifier,
            code: CODE,
          },
          (err) => {
            assert.ok(err.isJoi);
            assert.ok(err.name, 'ValidationError');
            assert.equal(
              err.details[0].message,
              // eslint-disable-next-line quotes
              `"code_verifier" length must be at least 43 characters long`
            ); // eslint-disable-line quotes
            done();
          }
        );
      });

      it('rejects pkce code_verifier that is too big', (done) => {
        const bad_code_verifier =
          PKCE_CODE_VERIFIER +
          PKCE_CODE_VERIFIER +
          PKCE_CODE_VERIFIER +
          PKCE_CODE_VERIFIER;
        v(
          {
            client_id: CLIENT_ID,
            code_verifier: bad_code_verifier,
            code: CODE,
          },
          (err) => {
            assert.ok(err.isJoi);
            assert.ok(err.name, 'ValidationError');
            assert.equal(
              err.details[0].message,
              // eslint-disable-next-line quotes
              `"code_verifier" length must be less than or equal to 128 characters long`
            ); // eslint-disable-line quotes
            done();
          }
        );
      });

      it('rejects pkce code_verifier that contains invalid characters', (done) => {
        const bad_code_verifier = PKCE_CODE_VERIFIER + ' :.';
        v(
          {
            client_id: CLIENT_ID,
            code_verifier: bad_code_verifier,
            code: CODE,
          },
          (err) => {
            assert.ok(err.isJoi);
            assert.ok(err.name, 'ValidationError');
            assert.equal(
              err.details[0].message,
              `"code_verifier" with value "${bad_code_verifier}" fails to match the required pattern: /^[A-Za-z0-9-_]+$/`
            );
            done();
          }
        );
      });
    });
  });

  describe('config handling', () => {
    const request = {
      headers: {},
      payload: {
        client_id: CLIENT_ID,
      },
    };

    it('allows clients that have not been disabled via config', async () => {
      request.payload.client_id = NON_DISABLED_CLIENT_ID;
      request.payload.grant_type = 'refresh_token';
      request.payload.refresh_token = REFRESH_TOKEN;
      try {
        await route.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        // The request still fails, but it fails at the point where we check the token,
        // meaning that the client_id was allowed through the disabled filter.
        assert.equal(err.errno, 108); // Invalid token.
      }
    });

    it('allows code grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'authorization_code';
      request.payload.code = CODE;
      try {
        await route.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        // The request still fails, but it fails at the point where we check the code,
        // meaning that the client_id was allowed through the disabled filter.
        assert.equal(err.errno, 105);
      }
    });

    it('returns an error on refresh_token grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'refresh_token';
      request.payload.refresh_token = REFRESH_TOKEN;
      try {
        await route.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.output.statusCode, 503);
        assert.equal(err.errno, 202); // Disabled client.
      }
    });

    it('returns an error on fxa-credentials grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'fxa-credentials';
      try {
        await route.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.output.statusCode, 503);
        assert.equal(err.errno, 202); // Disabled client.
      }
    });
    /*
    it('allows grants for enabled clients', async () => {
      const ppidSeed = Math.floor(Math.random() * 1024);
      request.payload.client_id = NON_DISABLED_CLIENT_ID;
      //request.payload.client_secret = CLIENT_SECRET;
      request.payload.grant_type = 'refresh_token';
      request.payload.scope = 'profile';
      //request.payload.refresh_token = REFRESH_TOKEN;
      //request.payload.ttl = 60 * 60 * 6; // 6 hrs
      request.payload.ppid_seed = ppidSeed;
      request.payload.resource = 'https://profile.accounts.firefox.com/v1/profile';

      try {
        const resp = await route.handler(request);
        assert.equal(resp, true);
      } catch (err) {
        assert.equal(JSON.stringify(err), null);
        assert.fail('should have passed');
      }

    });
  */
  });
});
