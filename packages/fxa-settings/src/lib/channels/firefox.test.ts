/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  firefox,
  FirefoxCommand,
  buildSyncOAuthSearch,
  FxAOAuthFlowBeginResponse,
} from './firefox';

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

describe('buildSyncOAuthSearch', () => {
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
    const search = buildSyncOAuthSearch({
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
});
