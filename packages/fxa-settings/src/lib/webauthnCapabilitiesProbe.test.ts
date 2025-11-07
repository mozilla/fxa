/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { maybeRecordWebAuthnCapabilities } from './webauthnCapabilitiesProbe';

// Mock glean wrapper used by the probe
jest.mock('./glean', () => ({
  __esModule: true,
  default: {
    getEnabled: jest.fn(),
    webauthn: {
      capabilities: jest.fn(),
    },
  },
}));

const GleanMetrics = require('./glean').default as {
  getEnabled: jest.Mock;
  webauthn: { capabilities: jest.Mock };
};

function setUA(ua: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
}

function setMathRandom(value: number) {
  jest.spyOn(Math, 'random').mockReturnValue(value);
}

async function flush() {
  await Promise.resolve();
  jest.runAllTimers();
}

describe('webauthnCapabilitiesProbe', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    jest.resetAllMocks();
    GleanMetrics.getEnabled.mockReturnValue(true);
    setUA(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    );
    (global as any).PublicKeyCredential = undefined;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does nothing when telemetry disabled', () => {
    GleanMetrics.getEnabled.mockReturnValue(false);
    setMathRandom(0.01);
    maybeRecordWebAuthnCapabilities(1);
    expect(GleanMetrics.webauthn.capabilities).not.toHaveBeenCalled();
  });

  it('samples ~10%: skips when random > 0.1', () => {
    setMathRandom(0.5);
    maybeRecordWebAuthnCapabilities(0.1);
    expect(GleanMetrics.webauthn.capabilities).not.toHaveBeenCalled();
  });

  it('dedupes for 30 days when key present', () => {
    setMathRandom(0.01);
    localStorage.setItem('webauthn:caps:v1', String(Date.now()));
    maybeRecordWebAuthnCapabilities(1);
    expect(GleanMetrics.webauthn.capabilities).not.toHaveBeenCalled();
  });

  it('emits supported=false when capability API missing', async () => {
    setMathRandom(0.01);
    maybeRecordWebAuthnCapabilities(1);
    await flush();
    expect(GleanMetrics.webauthn.capabilities).toHaveBeenCalledTimes(1);
    const arg = GleanMetrics.webauthn.capabilities.mock.calls[0][0];
    expect(arg.event.supported).toBe(false);
    expect(typeof arg.event.error_reason).toBe('string');
  });

  it('emits supported=true with flags and device buckets', async () => {
    setMathRandom(0.01);
    (global as any).PublicKeyCredential = {
      getClientCapabilities: jest.fn().mockResolvedValue({
        passkeyPlatformAuthenticator: true,
        conditionalGet: true,
        relatedOrigins: false,
        hybridTransport: true,
        userVerifyingPlatformAuthenticator: true,
        'extension:prf': false,
      }),
    };

    maybeRecordWebAuthnCapabilities(1);
    await flush();

    expect(
      (global as any).PublicKeyCredential.getClientCapabilities
    ).toHaveBeenCalled();
    expect(GleanMetrics.webauthn.capabilities).toHaveBeenCalledTimes(1);
    const { event } = GleanMetrics.webauthn.capabilities.mock.calls[0][0];
    expect(event.supported).toBe(true);
    expect(event.ppa).toBe(true);
    expect(event.cg).toBe(true);
    expect(event.rel).toBe(false);
    expect(event.hyb).toBe(true);
    expect(event.uvpa).toBe(true);
    expect(event.prf).toBe(false);
    // device buckets derived from UA
    expect(event.os_family).toBe('windows');
    expect(event.os_major).toBe('10');
    expect(event.browser_family).toBe('chrome');
    expect(event.browser_major).toBe('127');
    expect(typeof event.cpu_arm).toBe('boolean');
  });
});
