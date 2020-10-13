import assert from 'assert';
import '../server'; // must import this to run with nodejs
import { generateRecoveryKey } from 'fxa-auth-client/lib/recoveryKey';

// as seen in https://github.com/mozilla/fxa/blob/main/packages/fxa-content-server/app/tests/spec/lib/crypto/recovery-keys.js
const uid = 'aaaaabbbbbcccccdddddeeeeefffff00';
const keys = {
  kB: '000000111111222222333333444444555555666666777777888888999999ABCD',
};
const iv = new Uint8Array(Buffer.from('eeddccbbaa99887766554433', 'hex'));

// base32 of 0123456789ABCDEFGHJKMNPQRSTVWXYZ
const expectedRecoveryKey = new Uint8Array(
  Buffer.from('00443214c74254b635cf84653a56d7c675be77df', 'hex')
);
const expectedRecoveryKeyId = '6aa248931704886f54ac64b81b111bc0';
const expectedRecoveryData =
  'eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIiwia2lkIjoiNmFhMjQ4OTMxNzA0ODg2ZjU0YWM2NGI4MWIxMTFiYzAifQ..' +
  '7t3Mu6qZiHdmVUQz.qoXWfU77FBV67Pyy_GXAkoSuAbksIqAXZd2tkq48iD3u_qWEEAeYx-M3m2G373zes3OXsSZdJIGRFmd8bC9s4ZvN3kF3A6vK5g.' +
  'yT7bkdF8AYC6ecwsvRCI7A';

describe('lib/recoveryKey', () => {
  describe('generateRecoveryKey', () => {
    it('matches the test vector', async () => {
      const {
        recoveryKey,
        recoveryKeyId,
        recoveryData,
      } = await generateRecoveryKey(uid, keys, {
        testRecoveryKey: expectedRecoveryKey,
        testIV: iv,
      });
      assert.deepStrictEqual(recoveryKey, expectedRecoveryKey);
      assert.deepStrictEqual(recoveryKeyId, expectedRecoveryKeyId);
      assert.deepStrictEqual(recoveryData, expectedRecoveryData);
    });
  });
});
