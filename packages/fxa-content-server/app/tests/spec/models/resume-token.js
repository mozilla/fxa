/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import ResumeToken from 'models/resume-token';

const EMAIL = 'testuser@testuser.com';
const ENTRYPOINT = 'entrypoint';
const UNIQUE_USER_ID = 'uuid';

const TOKEN_OBJ = {
  deviceId: 'device-id',
  email: EMAIL,
  entrypoint: ENTRYPOINT,
  entrypointExperiment: 'entrypoint-experiment',
  entrypointVariation: 'entrypoint-experiment',
  flowBegin: Date.now(),
  flowId: 'a-big-flow-id',
  needsOptedInToMarketingEmail: true,
  newsletters: ['knowledge-is-power'],
  planId: 'wibble',
  productId: 'blee',
  resetPasswordConfirm: false,
  style: 'trailhead',
  uniqueUserId: UNIQUE_USER_ID,
  utmCampaign: 'campaign',
  utmContent: 'content',
  utmMedium: 'medium',
  utmSource: 'source',
  utmTerm: 'term',
};

describe('models/resume-token', function() {
  it('expected fields are allowed in resume token', () => {
    assert.lengthOf(ResumeToken.ALLOWED_KEYS, 19);
    assert.sameMembers(ResumeToken.ALLOWED_KEYS, Object.keys(TOKEN_OBJ));
  });

  describe('ResumeToken.stringify', function() {
    it('stringifies an object into an opaque token', function() {
      assert.ok(ResumeToken.stringify(TOKEN_OBJ));
    });
  });

  describe('ResumeToken.parse', function() {
    it('converts the stringified opaque token into an object', function() {
      const stringifiedToken = ResumeToken.stringify(TOKEN_OBJ);
      const parsedToken = ResumeToken.parse(stringifiedToken);
      assert.deepEqual(parsedToken, TOKEN_OBJ);
    });

    it('returns nothing if the token is invalid', function() {
      assert.isUndefined(ResumeToken.parse('asdf'));
    });
  });

  describe('creation', function() {
    it('should populate the resume token', function() {
      const resumeToken = new ResumeToken(TOKEN_OBJ);
      // eslint-disable-next-line no-unused-vars
      for (const key in TOKEN_OBJ) {
        assert.equal(resumeToken.get(key), TOKEN_OBJ[key]);
      }
    });

    it('should ignore fields that are not explicitly allowed', function() {
      const parsedToken = {
        ignored: true,
      };
      const resumeToken = new ResumeToken(parsedToken);
      assert.isFalse(resumeToken.has('ignored'));
    });
  });

  describe('stringify', function() {
    it('should stringify explicitly allowed fields', function() {
      const resumeToken = new ResumeToken(TOKEN_OBJ);

      resumeToken.set('notStringified', true);

      // the value is saved, but not stringified.
      assert.equal(resumeToken.get('notStringified'), true);

      const stringified = resumeToken.stringify();
      const parsed = ResumeToken.parse(stringified);
      assert.deepEqual(parsed, TOKEN_OBJ);
      assert.isFalse('notStringified' in parsed);
    });
  });
});
