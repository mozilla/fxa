/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');
const assert = require('insist');
const nock = require('nock');

const config = require('../lib/config');
const unique = require('../lib/unique');

const verifyAssertion = require('../lib/browserid');

const ISSUER = config.get('browserid.issuer');
const AUDIENCE = config.get('publicUrl');
const USERID = unique(16).toString('hex');
const EMAIL = USERID + '@' + ISSUER;
const GENERATION = 12345;
const VERIFIED_EMAIL = 'test@exmample.com';
const LAST_AUTH_AT = Date.now();
const AMR = ['pwd', 'otp'];
const AAL = 2;

const ERRNO_INVALID_ASSERTION = 104;

const GOOD_RESPONSE = {
  status: 'okay',
  email: EMAIL,
  issuer: ISSUER,
  idpClaims: {
    'fxa-generation': GENERATION,
    'fxa-verifiedEmail': VERIFIED_EMAIL,
    'fxa-lastAuthAt': LAST_AUTH_AT,
    'fxa-tokenVerified': true,
    'fxa-amr': AMR,
    'fxa-aal': AAL
  }
};

const MOCK_ASSERTION = 'mock-assertion';

const VERIFIER_URL = url.parse(config.get('browserid.verificationUrl'));

function mockVerifierResponse(status, body) {
  return nock(VERIFIER_URL.protocol + '//' + VERIFIER_URL.host)
    .post(VERIFIER_URL.path, body => {
      assert.deepEqual(body, {
        assertion: MOCK_ASSERTION,
        audience: AUDIENCE
      });
      return true;
    })
    .reply(status, Object.assign({}, body));
}

/*global describe,it*/

describe('browserid verifyAssertion', function() {

  it('should accept well-formed signed assertions', () => {
    mockVerifierResponse(200, GOOD_RESPONSE);
    return verifyAssertion(MOCK_ASSERTION).then(claims => {
      assert.deepEqual(claims, {
        uid: USERID,
        'fxa-generation': GENERATION,
        'fxa-verifiedEmail': VERIFIED_EMAIL,
        'fxa-lastAuthAt': LAST_AUTH_AT,
        'fxa-tokenVerified': true,
        'fxa-amr': AMR,
        'fxa-aal': AAL
      });
    });
  });

  it('should reject assertions that do not validate okay', () => {
    mockVerifierResponse(200, { status: 'error' });
    return verifyAssertion(MOCK_ASSERTION).then(
      () => {
        assert.fail('verification should have failed');
      },
      (err) => {
        assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
      }
    );
  });

  it('should reject assertions from non-allowed issuers', () => {
    mockVerifierResponse(200, Object.assign({}, GOOD_RESPONSE, {
      issuer: 'evil.com'
    }));
    return verifyAssertion(MOCK_ASSERTION).then(
      () => {
        assert.fail('verification should have failed');
      },
      (err) => {
        assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
      }
    );
  });

  it('should reject assertions where email does not match issuer', () => {
    mockVerifierResponse(200, Object.assign({}, GOOD_RESPONSE, {
      email: USERID + '@evil.com'
    }));
    return verifyAssertion(MOCK_ASSERTION).then(
      () => {
        assert.fail('verification should have failed');
      },
      (err) => {
        assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
      }
    );
  });

  it('should reject assertions with email does not match issuer', () => {
    mockVerifierResponse(200, Object.assign({}, GOOD_RESPONSE, {
      email: USERID + '@evil.com'
    }));
    return verifyAssertion(MOCK_ASSERTION).then(
      () => {
        assert.fail('verification should have failed');
      },
      (err) => {
        assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
      }
    );
  });

  it('should reject assertions with a malformed user id', () => {
    mockVerifierResponse(200, Object.assign({}, GOOD_RESPONSE, {
      email: 'non-hex-string@' + ISSUER
    }));
    return verifyAssertion(MOCK_ASSERTION).then(
      () => {
        assert.fail('verification should have failed');
      },
      (err) => {
        assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
      }
    );
  });

  it('should reject assertions with missing `lastAuthAt` claim', () => {
    const response = Object.assign({}, GOOD_RESPONSE, {
      idpClaims: Object.assign({}, GOOD_RESPONSE.idpClaims)
    });
    delete response['idpClaims']['fxa-lastAuthAt'];
    mockVerifierResponse(200, response);
    return verifyAssertion(MOCK_ASSERTION).then(
      () => {
        assert.fail('verification should have failed');
      },
      (err) => {
        assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
      }
    );
  });

  it('should accept assertions with missing `amr` claim', () => {
    const response = Object.assign({}, GOOD_RESPONSE, {
      idpClaims: Object.assign({}, GOOD_RESPONSE.idpClaims)
    });
    delete response['idpClaims']['fxa-amr'];
    mockVerifierResponse(200, response);
    return verifyAssertion(MOCK_ASSERTION).then(claims => {
      assert.deepEqual(Object.keys(claims).sort(), [
        'fxa-aal',
        'fxa-generation',
        'fxa-lastAuthAt',
        'fxa-tokenVerified',
        'fxa-verifiedEmail',
        'uid'
      ]);
    });
  });

  it('should accept assertions with missing `aal` claim', () => {
    const response = Object.assign({}, GOOD_RESPONSE, {
      idpClaims: Object.assign({}, GOOD_RESPONSE.idpClaims)
    });
    delete response['idpClaims']['fxa-aal'];
    mockVerifierResponse(200, response);
    return verifyAssertion(MOCK_ASSERTION).then(claims => {
      assert.deepEqual(Object.keys(claims).sort(), [
        'fxa-amr',
        'fxa-generation',
        'fxa-lastAuthAt',
        'fxa-tokenVerified',
        'fxa-verifiedEmail',
        'uid'
      ]);
    });
  });

});
