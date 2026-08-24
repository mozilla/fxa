/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constants } from '../constants';
import {
  firefox,
  Firefox,
  FirefoxCommand,
  buildOAuthSearch,
  FxAOAuthFlowBeginResponse,
  WebChannelService,
  PairOAuthFinishState,
  PairOAuthStartState,
} from './firefox';

// Keep in sync with DEFAULT_SEND_TIMEOUT_LENGTH_MS in firefox.ts (not exported).
const SEND_TIMEOUT_MS = 500;

describe('Firefox pairing WebChannel methods', () => {
  let sendSpy: jest.SpyInstance;
  const originalRAF = window.requestAnimationFrame;

  beforeEach(() => {
    sendSpy = jest.spyOn(firefox, 'send').mockImplementation(() => {});
    // Make requestAnimationFrame invoke the callback synchronously so
    // the send() call inside sendPairingCommand is visible immediately.
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    };
  });

  afterEach(() => {
    sendSpy.mockRestore();
    window.requestAnimationFrame = originalRAF;
  });

  it('pairAuthorize sends PairAuthorize command', () => {
    firefox.pairAuthorize('chan-123');
    expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairAuthorize, {
      channel_id: 'chan-123',
    });
  });

  it('pairDecline sends PairDecline command', () => {
    firefox.pairDecline('chan-123');
    expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairDecline, {
      channel_id: 'chan-123',
    });
  });

  it('pairComplete sends PairComplete command', () => {
    firefox.pairComplete('chan-123');
    expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairComplete, {
      channel_id: 'chan-123',
    });
  });

  it('pairHeartbeat resolves when response event fires', async () => {
    const promise = firefox.pairHeartbeat('chan-123');
    firefox.dispatchEvent(
      new CustomEvent(FirefoxCommand.PairHeartbeat, {
        detail: { suppAuthorized: true },
      })
    );
    const result = await promise;
    expect(result).toEqual({ suppAuthorized: true });
  });

  it('pairSupplicantMetadata resolves when response event fires', async () => {
    const promise = firefox.pairSupplicantMetadata('chan-123');
    firefox.dispatchEvent(
      new CustomEvent(FirefoxCommand.PairSupplicantMetadata, {
        detail: { ua: 'Mozilla/5.0', city: 'Portland' },
      })
    );
    const result = await promise;
    expect(result).toEqual({ ua: 'Mozilla/5.0', city: 'Portland' });
  });
});

describe('buildOAuthSearch', () => {
  const MOCK_CODE_VERIFIER = 'au3dqDz2dOB0_vSikXCUf4S8Gc-37dL-F7sGxtxpR3R';

  // Mirrors a real fxa_oauth_flow_begin response. Firefox derives the challenge
  // from a verifier it keeps in the parent process, so a verifier is never part
  // of this payload.
  const OAUTH_PARAMS: FxAOAuthFlowBeginResponse = {
    action: 'email',
    response_type: 'code',
    access_type: 'offline',
    scope: 'profile https://identity.mozilla.com/apps/oldsync',
    client_id: '5882386c6d801776',
    state: 'PFYyaGZuNlZ4TGpQdw',
    code_challenge: 'BVfwwa_Z33Jhs-GUd62k0d6NIBqXfEjT0dHMseOOtgo',
    code_challenge_method: 'S256',
    keys_jwk: 'eyJjcnYiOiJQLTI1NiIsImt0eSI6IkVDIn0',
  };

  it('forwards only the allowlisted OAuth params, so no code_verifier reaches /authorization', () => {
    // The extra fields matter: with a payload of allowlisted keys only, this
    // would still pass if the allowlist were replaced by a spread. The response
    // type has no verifier field, but the payload crosses a trust boundary and
    // TypeScript is erased, so a compromised Firefox could put one on the wire.
    const search = buildOAuthSearch({
      ...OAUTH_PARAMS,
      code_verifier: MOCK_CODE_VERIFIER,
      sessionToken: 'deadbeef',
      unexpected: 'whatever',
    } as FxAOAuthFlowBeginResponse);

    expect([...search.keys()].sort()).toEqual([
      'access_type',
      'action',
      'client_id',
      'code_challenge',
      'code_challenge_method',
      'context',
      'keys_jwk',
      'response_type',
      'scope',
      'service',
      'state',
    ]);
    expect(search.get('code_challenge')).toBe(OAUTH_PARAMS.code_challenge);
    expect(search.toString()).not.toContain(MOCK_CODE_VERIFIER);
  });

  // Precedence: the caller argument, then the browser echo, then sync.
  it.each([
    { echoed: undefined, passed: undefined, expected: 'sync' },
    { echoed: undefined, passed: 'relay', expected: 'relay' },
    { echoed: 'vpn', passed: undefined, expected: 'vpn' },
    { echoed: 'vpn', passed: 'sync', expected: 'sync' },
    // The echo crosses a trust boundary and the type is erased, so an
    // unrecognized name must not reach the sign-in URL.
    {
      echoed: 'evil' as WebChannelService,
      passed: undefined,
      expected: 'sync',
    },
  ] as const)(
    'sets service=$expected when the browser echoes $echoed and the caller passes $passed',
    ({ echoed, passed, expected }) => {
      const search = buildOAuthSearch(
        { ...OAUTH_PARAMS, service: echoed },
        passed
      );
      expect(search.get('service')).toBe(expected);
    }
  );
});

describe('Firefox pairing OAuth WebChannel methods', () => {
  // pairOauthFinish overrides the default; it makes a web call.
  const FINISH_TIMEOUT_MS = 10_000;

  const MOCK_START_RESPONSE: PairOAuthStartState = {
    state: 'mock-oauth-state',
    scope: 'profile https://identity.mozilla.com/apps/oldsync',
    code_challenge: 'mock-code-challenge',
    keys_jwk: 'mock-keys-jwk',
  };

  const MOCK_FINISH_REQUEST = {
    client_id: '5882386c6d801776',
    state: 'mock-oauth-state',
    scope: 'profile',
    code_challenge: 'mock-code-challenge',
  };

  const MOCK_FINISH_RESPONSE: PairOAuthFinishState = {
    state: 'mock-oauth-state',
    code: 'mock-oauth-code',
  };

  // These use their own Firefox instance rather than the exported singleton so
  // a listener left over from one case can never settle a promise in another.
  let ff: Firefox;
  let sendSpy: jest.SpyInstance;
  const originalRAF = window.requestAnimationFrame;

  beforeEach(() => {
    jest.useFakeTimers();
    ff = new Firefox();
    sendSpy = jest.spyOn(ff, 'send').mockImplementation(() => {});
    // Silence the debug/warn logging these commands emit.
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Invoke requestAnimationFrame synchronously so the send() call inside
    // _executeCommandWithResponse is visible immediately.
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.requestAnimationFrame = originalRAF;
    jest.useRealTimers();
  });

  describe('pairOauthStart', () => {
    it('sends the default sync scopes when none are provided', async () => {
      const promise = ff.pairOauthStart({});
      expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairOauthStart, {
        scopes: [
          Constants.OAUTH_OLDSYNC_SCOPE,
          Constants.OAUTH_TRUSTED_PROFILE_SCOPE,
        ],
      });

      ff.dispatchEvent(
        new CustomEvent(FirefoxCommand.PairOauthStart, {
          detail: MOCK_START_RESPONSE,
        })
      );
      await promise;
    });

    it('sends the provided scopes instead of the defaults', async () => {
      const promise = ff.pairOauthStart({ scopes: ['profile:email'] });
      expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairOauthStart, {
        scopes: ['profile:email'],
      });

      ff.dispatchEvent(
        new CustomEvent(FirefoxCommand.PairOauthStart, {
          detail: MOCK_START_RESPONSE,
        })
      );
      await promise;
    });

    it('sends an empty scope list without substituting the defaults', async () => {
      const promise = ff.pairOauthStart({ scopes: [] });
      expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.PairOauthStart, {
        scopes: [],
      });

      ff.dispatchEvent(
        new CustomEvent(FirefoxCommand.PairOauthStart, {
          detail: MOCK_START_RESPONSE,
        })
      );
      await promise;
    });

    it('resolves with the oauth start state from the response event', async () => {
      const promise = ff.pairOauthStart({});
      ff.dispatchEvent(
        new CustomEvent(FirefoxCommand.PairOauthStart, {
          detail: MOCK_START_RESPONSE,
        })
      );
      await expect(promise).resolves.toEqual(MOCK_START_RESPONSE);
    });

    // NOTE: two of the expected messages below are inaccurate in firefox.ts —
    // every message is prefixed with PairOauthFinish rather than PairOauthStart,
    // and an absent `scope` reports "missing code". Asserted as-is so the
    // strings stay pinned; see the review note about correcting them.
    it.each([
      { field: 'state', message: 'missing state from event.details' },
      { field: 'scope', message: 'missing code from event.details' },
      {
        field: 'code_challenge',
        message: 'missing code_challenge from event.details',
      },
      { field: 'keys_jwk', message: 'missing keys_jwk from event.details' },
    ])(
      'rejects when the response is missing $field',
      async ({ field, message }) => {
        const promise = ff.pairOauthStart({});
        const detail: Record<string, string> = { ...MOCK_START_RESPONSE };
        delete detail[field];
        ff.dispatchEvent(
          new CustomEvent(FirefoxCommand.PairOauthStart, { detail })
        );
        await expect(promise).rejects.toThrow(
          `${FirefoxCommand.PairOauthFinish} ${message}`
        );
      }
    );

    it('resolves undefined when the browser does not respond', async () => {
      const promise = ff.pairOauthStart({});
      jest.advanceTimersByTime(SEND_TIMEOUT_MS);
      await expect(promise).resolves.toBeUndefined();
    });

    it('does not resolve before the timeout elapses', async () => {
      const onSettled = jest.fn();
      ff.pairOauthStart({}).then(onSettled);

      await jest.advanceTimersByTimeAsync(SEND_TIMEOUT_MS - 1);
      expect(onSettled).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(1);
      expect(onSettled).toHaveBeenCalledWith(undefined);
    });
  });

  describe('pairOauthFinish', () => {
    it('sends the PairOauthFinish command with the given message', async () => {
      const promise = ff.pairOauthFinish(MOCK_FINISH_REQUEST);
      expect(sendSpy).toHaveBeenCalledWith(
        FirefoxCommand.PairOauthFinish,
        MOCK_FINISH_REQUEST
      );

      ff.dispatchEvent(
        new CustomEvent(FirefoxCommand.PairOauthFinish, {
          detail: MOCK_FINISH_RESPONSE,
        })
      );
      await promise;
    });

    it('resolves with the code and state from the response event', async () => {
      const promise = ff.pairOauthFinish(MOCK_FINISH_REQUEST);
      ff.dispatchEvent(
        new CustomEvent(FirefoxCommand.PairOauthFinish, {
          detail: MOCK_FINISH_RESPONSE,
        })
      );
      await expect(promise).resolves.toEqual(MOCK_FINISH_RESPONSE);
    });

    it.each([
      { field: 'code', message: 'missing code from event.details' },
      { field: 'state', message: 'missing state from event.details' },
    ])(
      'rejects when the response is missing $field',
      async ({ field, message }) => {
        const promise = ff.pairOauthFinish(MOCK_FINISH_REQUEST);
        const detail: Record<string, string> = { ...MOCK_FINISH_RESPONSE };
        delete detail[field];
        ff.dispatchEvent(
          new CustomEvent(FirefoxCommand.PairOauthFinish, { detail })
        );
        await expect(promise).rejects.toThrow(
          `${FirefoxCommand.PairOauthFinish} ${message}`
        );
      }
    );

    // The state we sent is the only one we are willing to finish on: a response
    // carrying a different state is a different flow's, so the code it comes
    // with must not be redeemed.
    it('rejects when the response state does not match the requested state', async () => {
      const promise = ff.pairOauthFinish(MOCK_FINISH_REQUEST);
      ff.dispatchEvent(
        new CustomEvent(FirefoxCommand.PairOauthFinish, {
          detail: { ...MOCK_FINISH_RESPONSE, state: 'other-flow-state' },
        })
      );
      await expect(promise).rejects.toThrow(
        `${FirefoxCommand.PairOauthFinish} invalid state!`
      );
    });

    it('resolves undefined when the browser does not respond', async () => {
      const promise = ff.pairOauthFinish(MOCK_FINISH_REQUEST);
      jest.advanceTimersByTime(FINISH_TIMEOUT_MS);
      await expect(promise).resolves.toBeUndefined();
    });

    it('removes its response listener when the request times out', async () => {
      const removeSpy = jest.spyOn(ff, 'removeEventListener');
      const promise = ff.pairOauthFinish(MOCK_FINISH_REQUEST);
      jest.advanceTimersByTime(FINISH_TIMEOUT_MS);
      await promise;

      expect(removeSpy).toHaveBeenCalledWith(
        FirefoxCommand.PairOauthFinish,
        expect.any(Function)
      );
    });

    it('clears the timeout once the browser responds', async () => {
      const promise = ff.pairOauthFinish(MOCK_FINISH_REQUEST);
      ff.dispatchEvent(
        new CustomEvent(FirefoxCommand.PairOauthFinish, {
          detail: MOCK_FINISH_RESPONSE,
        })
      );
      await promise;

      jest.advanceTimersByTime(SEND_TIMEOUT_MS);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});

describe('fxaOAuthFlowBegin', () => {
  const SCOPES = ['profile', Constants.OAUTH_OLDSYNC_SCOPE];

  let ff: Firefox;
  let sendSpy: jest.SpyInstance;
  const originalRAF = window.requestAnimationFrame;

  beforeEach(() => {
    jest.useFakeTimers();
    ff = new Firefox();
    sendSpy = jest.spyOn(ff, 'send').mockImplementation(() => {});
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.requestAnimationFrame = originalRAF;
    jest.useRealTimers();
  });

  // Let the request time out so a pending promise cannot leak into the next case.
  const settle = async (promise: Promise<unknown>) => {
    jest.advanceTimersByTime(SEND_TIMEOUT_MS);
    await promise;
  };

  it.each(['sync', 'relay'] as const)(
    'sends service=%s with the scopes',
    async (service) => {
      const promise = ff.fxaOAuthFlowBegin(SCOPES, service);
      expect(sendSpy).toHaveBeenCalledWith(FirefoxCommand.OAuthFlowBegin, {
        scopes: SCOPES,
        service,
      });
      await settle(promise);
    }
  );

  it('omits the service when the caller passes none', async () => {
    const promise = ff.fxaOAuthFlowBegin(SCOPES);
    // toStrictEqual, because toEqual would pass on a `service: undefined` key.
    expect(sendSpy.mock.calls[0][1]).toStrictEqual({ scopes: SCOPES });
    await settle(promise);
  });
});
