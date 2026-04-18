/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let hashResult = Array(40).fill('0').join('');
const hash = {
  update: jest.fn(),
  digest: jest.fn(() => hashResult),
};
const mockCrypto = {
  createHash: jest.fn(() => hash),
};

jest.mock('crypto', () => mockCrypto);

const config = {
  lastAccessTimeUpdates: {} as any,
  signinConfirmation: {},
  signinUnblock: {},
  securityHistory: {},
};

// Import after jest.mock
const featuresModule = require('./features');
const features = featuresModule(config);

describe('features', () => {
  beforeEach(() => {
    mockCrypto.createHash.mockClear();
    hash.update.mockClear();
    hash.digest.mockClear();
  });

  it('interface is correct', () => {
    expect(typeof featuresModule.schema).toBe('object');
    expect(featuresModule.schema).not.toBeNull();

    expect(typeof features).toBe('object');
    expect(Object.keys(features)).toHaveLength(2);
    expect(typeof features.isSampledUser).toBe('function');
    expect(typeof features.isLastAccessTimeEnabledForUser).toBe('function');
  });

  it('isSampledUser returns true when sample rate is 1', () => {
    const uid = Array(64).fill('f').join('');
    const sampleRate = 1;
    hashResult = Array(40).fill('f').join('');

    expect(features.isSampledUser(sampleRate, uid, 'foo')).toBe(true);

    expect(mockCrypto.createHash).toHaveBeenCalledTimes(0);
    expect(hash.update).toHaveBeenCalledTimes(0);
    expect(hash.digest).toHaveBeenCalledTimes(0);
  });

  it('isSampledUser returns false when sample rate is 0', () => {
    const uid = Array(64).fill('f').join('');
    const sampleRate = 0;
    hashResult = Array(40).fill('0').join('');

    expect(features.isSampledUser(sampleRate, uid, 'foo')).toBe(false);

    expect(mockCrypto.createHash).toHaveBeenCalledTimes(0);
    expect(hash.update).toHaveBeenCalledTimes(0);
    expect(hash.digest).toHaveBeenCalledTimes(0);
  });

  it('isSampledUser returns true when sample rate is greater than cohort value', () => {
    const uid = Array(64).fill('f').join('');
    const sampleRate = 0.05;
    // First 27 characters are ignored, last 13 are 0.04 * 0xfffffffffffff
    hashResult = '0000000000000000000000000000a3d70a3d70a6';

    expect(features.isSampledUser(sampleRate, uid, 'foo')).toBe(true);

    expect(mockCrypto.createHash).toHaveBeenCalledTimes(1);
    let args: any = mockCrypto.createHash.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toBe('sha1');

    expect(hash.update).toHaveBeenCalledTimes(2);
    args = hash.update.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toBe(uid.toString());
    args = hash.update.mock.calls[1];
    expect(args).toHaveLength(1);
    expect(args[0]).toBe('foo');

    expect(hash.digest).toHaveBeenCalledTimes(1);
    args = hash.digest.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toBe('hex');
  });

  it('isSampledUser returns false when sample rate equals cohort value', () => {
    const uid = Array(64).fill('f').join('');
    const sampleRate = 0.04;
    hashResult = '0000000000000000000000000000a3d70a3d70a6';

    expect(features.isSampledUser(sampleRate, uid, 'bar')).toBe(false);

    expect(mockCrypto.createHash).toHaveBeenCalledTimes(1);
    expect(hash.update).toHaveBeenCalledTimes(2);
    expect(hash.update.mock.calls[0][0]).toBe(uid.toString());
    expect(hash.update.mock.calls[1][0]).toBe('bar');
    expect(hash.digest).toHaveBeenCalledTimes(1);
  });

  it('isSampledUser returns false when sample rate is less than cohort value', () => {
    const uid = Array(64).fill('f').join('');
    const sampleRate = 0.03;

    expect(features.isSampledUser(sampleRate, uid, 'foo')).toBe(false);
  });

  it('isSampledUser with different uid', () => {
    const uid = Array(64).fill('7').join('');
    const sampleRate = 0.03;
    // First 27 characters are ignored, last 13 are 0.02 * 0xfffffffffffff
    hashResult = '000000000000000000000000000051eb851eb852';

    mockCrypto.createHash.mockClear();
    hash.update.mockClear();
    hash.digest.mockClear();

    expect(features.isSampledUser(sampleRate, uid, 'wibble')).toBe(true);

    expect(hash.update).toHaveBeenCalledTimes(2);
    expect(hash.update.mock.calls[0][0]).toBe(uid);
    expect(hash.update.mock.calls[1][0]).toBe('wibble');
  });

  it('isLastAccessTimeEnabledForUser', () => {
    const uid = 'foo';
    const email = 'bar@mozilla.com';
    // First 27 characters are ignored, last 13 are 0.02 * 0xfffffffffffff
    hashResult = '000000000000000000000000000051eb851eb852';

    config.lastAccessTimeUpdates.enabled = true;
    config.lastAccessTimeUpdates.sampleRate = 0;

    config.lastAccessTimeUpdates.sampleRate = 0.03;
    expect(features.isLastAccessTimeEnabledForUser(uid, email)).toBe(true);

    config.lastAccessTimeUpdates.sampleRate = 0.02;
    expect(features.isLastAccessTimeEnabledForUser(uid, email)).toBe(false);

    config.lastAccessTimeUpdates.enabled = false;
    config.lastAccessTimeUpdates.sampleRate = 0.03;
    expect(features.isLastAccessTimeEnabledForUser(uid, email)).toBe(false);
  });
});
