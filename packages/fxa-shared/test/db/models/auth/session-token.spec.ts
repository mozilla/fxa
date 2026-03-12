import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import { SessionToken } from '../../../../db/models/auth';
import { uuidTransformer } from '../../../../db/transformers';
import crypto from 'crypto';

const toRandomBuff = (size) =>
  uuidTransformer.to(crypto.randomBytes(size).toString('hex'));

describe('SessionToken Unit Tests', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('filters out expired tokens (older than 28 days by default)', async () => {
    const now = Date.now();
    // 28 days in milliseconds is 2419200000
    const validTime = now - 2419200000 + 10000; // 10 seconds remaining
    const expiredTime = now - 2419200000 - 10000; // 10 seconds overdue

    const uidBuff = toRandomBuff(16);

    const validRow = {
      tokenId: toRandomBuff(16),
      tokenData: toRandomBuff(16),
      uid: uidBuff,
      createdAt: validTime,
      lastAccessTime: validTime,
      authAt: 1,
      verificationMethod: 0,
      verifiedAt: 0,
      mustVerify: 0,
      deviceId: null, // explicit null for no device
      emailVerified: 1,
      email: 'test@test.com',
      emailCode: 'code',
      deviceCallbackIsExpired: 0,
    };

    const expiredRow = {
      ...validRow,
      tokenId: toRandomBuff(16),
      createdAt: expiredTime,
    };

    sandbox.stub(SessionToken, 'callProcedure').resolves({
      rows: [validRow, expiredRow],
    });

    const tokens = await SessionToken.findByUid(
      '0123456789abcdef0123456789abcdef'
    );

    assert.equal(
      tokens.length,
      1,
      'Should return exactly 1 token (the valid one)'
    );
    assert.equal(tokens[0].createdAt, validTime);
  });

  it('respects configured expiry', async () => {
    const originalExpiry = SessionToken.sessionExpiryMs;
    try {
      // Set expiry to 1 hour
      SessionToken.sessionExpiryMs = 60 * 60 * 1000; // 1 hour
      const now = Date.now();
      const validTime = now - 30 * 60 * 1000; // 30 mins old (valid)
      const expiredTime = now - 90 * 60 * 1000; // 90 mins old (expired)

      const uidBuff = toRandomBuff(16);

      const validRow = {
        tokenId: toRandomBuff(16),
        tokenData: toRandomBuff(16),
        uid: uidBuff,
        createdAt: validTime,
        lastAccessTime: validTime,
        authAt: 1,
        verificationMethod: 0,
        verifiedAt: 0,
        mustVerify: 0,
        deviceId: null,
        emailVerified: 1,
        email: 'test@test.com',
        emailCode: 'code',
        deviceCallbackIsExpired: 0,
      };

      const expiredRow = {
        ...validRow,
        tokenId: toRandomBuff(16),
        createdAt: expiredTime,
      };

      sandbox.stub(SessionToken, 'callProcedure').resolves({
        rows: [validRow, expiredRow],
      });

      const tokens = await SessionToken.findByUid(
        '0123456789abcdef0123456789abcdef'
      );

      assert.equal(
        tokens.length,
        1,
        'Should return exactly 1 token (the valid one)'
      );
      assert.equal(tokens[0].createdAt, validTime);
    } finally {
      SessionToken.sessionExpiryMs = originalExpiry;
    }
  });
});
