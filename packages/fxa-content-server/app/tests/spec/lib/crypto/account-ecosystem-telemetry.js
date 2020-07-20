/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import aet from 'lib/crypto/account-ecosystem-telemetry';

describe('lib/crypto/account-ecosystem-telemetry', () => {
  // borrowing some setup from scoped-keys. maybe this could get pulled out
  // into a setup file.
  const keys = {
    kA: 'bba2ea983743324201a921e816f2e00e25da54473c9aa3ef050209c0f3bb8d86',
    kB: 'f5c47b97aecaf7dca9e020e4ea427f8431334a505cda40f09f3d9577e0006185',
  };
  // except for this, AET has its own scope
  const uid = 'aeaa1725c7a24ff983c6295725d5fc9b';
  // and except for this, the example pipeline keys from the AET: Anonymizing User Identifiers doc:
  // https://docs.google.com/document/d/1zH3eVVI_28Afg1JXe_McDrW4MTYuWhiJMQR6AQbli8I/edit#heading=h.afxekiwozsr1
  const pipelineKeys = {
    public: {
      kty: 'EC',
      kid: '0VEE7fOKqlWGTfkcKZEBvYiwvJLa4TPiITlW0bNp7jU',
      crv: 'P-256',
      x: 'TiNU3H-HMcup3mMeO7XsWYffjAeVbIhSRxCleVn4bag',
      y: 'aMkrcWw9qSFoXyBY2awKRnk4SvLRFRgqPGKC1YCJYUI',
    },
    private: {
      kty: 'EC',
      kid: '0VEE7fOKqlWGTfkcKZEBvYiwvJLa4TPiITlW0bNp7jU',
      crv: 'P-256',
      x: 'TiNU3H-HMcup3mMeO7XsWYffjAeVbIhSRxCleVn4bag',
      y: 'aMkrcWw9qSFoXyBY2awKRnk4SvLRFRgqPGKC1YCJYUI',
      d: 'ddgmfpSjzSDIg9MztLjq6nNQL6y5zXZv1ulKCPYwhhQ',
    },
  };

  describe('generateEcosystemAnonID', () => {
    describe('input validation', () => {
      it('throws if no uid parameter', async () => {
        try {
          await aet.generateEcosystemAnonID(
            undefined,
            keys.kB,
            pipelineKeys.public
          );
        } catch (err) {
          assert.equal(err.message, 'uid is required');
        }
      });
      it('throws if no kB parameter', async () => {
        try {
          await aet.generateEcosystemAnonID(
            uid,
            undefined,
            pipelineKeys.public
          );
        } catch (err) {
          assert.equal(err.message, 'kB is required');
        }
      });
      it('throws if no pipelineKey parameter', async () => {
        try {
          await aet.generateEcosystemAnonID(uid, keys.kB, undefined);
        } catch (err) {
          assert.equal(err.message, 'pipelineKey is required');
        }
      });
    });
    it('derives the ecosystem_anon_id value from the scoped key and pipelineKey as expected', async () => {
      const result = await aet.generateEcosystemAnonID(
        uid,
        keys.kB,
        pipelineKeys.public
      );
      // Need to figure out what exactly to assert here. For now, assert it's
      // non-empty.
      // (We could decrypt using the private key, then verify the bytes look
      // correct?)
      assert(result);
    });
  });
});
