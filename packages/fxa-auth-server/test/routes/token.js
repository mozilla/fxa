/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');
const route = require('../../lib/routes/token');

const CLIENT_SECRET = 'b93ef8a8f3e553a430d7e5b904c6132b2722633af9f03128029201d24a97f2a8';
const CLIENT_ID = '98e6508e88680e1b';
const CODE = 'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';
const PKCE_CODE_VERIFIER = 'ywZ_yiNpe-UoGYW.oW95hTjRZ8j_d2kF';
const GRANT_JWT = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

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
  // route validation function
  function v(req, cb) {
    route.validate.payload(req, {}, cb);
  }

  it('fails with no client_id', (done) => {
    v({
      client_secret: CLIENT_SECRET,
      code: CODE
    }, (err) => {
      joiRequired(err, 'client_id');
      done();
    });
  });

  it('valid client_secret scheme', (done) => {
    v({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: CODE
    }, (err) => {
      assert.equal(err, null);
      done();
    });
  });

  it('requires client_secret', (done) => {
    v({
      client_id: CLIENT_ID,
      code: CODE
    }, (err) => {
      joiRequired(err, 'client_secret');
      done();
    });
  });

  it('accepts pkce code_verifier instead of client_secret', (done) => {
    v({
      client_id: CLIENT_ID,
      code_verifier: PKCE_CODE_VERIFIER,
      code: CODE
    }, (err) => {
      assert.equal(err, null);
      done();
    });
  });

  describe('grant_type JWT', () => {
    it('forbids client_id', (done) => {
      v({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: CODE,
        grant_type: GRANT_JWT,
      }, (err) => {
        joiNotAllowed(err, 'client_id');
        done();
      });
    });

    it('forbids client_secret', (done) => {
      v({
        client_secret: CLIENT_SECRET,
        code: CODE,
        grant_type: GRANT_JWT,
      }, (err) => {
        joiNotAllowed(err, 'client_secret');
        done();
      });
    });

    it('forbids client_secret', (done) => {
      v({
        client_secret: CLIENT_SECRET,
        code: CODE,
        grant_type: GRANT_JWT,
      }, (err) => {
        joiNotAllowed(err, 'client_secret');
        done();
      });
    });

    it('forbids code_verifier', (done) => {
      v({
        code_verifier: PKCE_CODE_VERIFIER,
        grant_type: GRANT_JWT,
      }, (err) => {
        joiNotAllowed(err, 'code_verifier');
        done();
      });
    });

    it('forbids code', (done) => {
      v({
        code: CODE,
        grant_type: GRANT_JWT,
      }, (err) => {
        joiNotAllowed(err, 'code');
        done();
      });
    });

  });

});
