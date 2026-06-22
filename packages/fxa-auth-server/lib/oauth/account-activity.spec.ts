/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fxaShared from 'fxa-shared';

import * as Sentry from '@sentry/node';

import { recordActivity } from './account-activity';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}));

const mockCaptureException = Sentry.captureException as jest.MockedFunction<
  typeof Sentry.captureException
>;

const ScopeSet = (fxaShared as any).oauth.scopes;

const SCOPE_OLDSYNC = 'https://identity.mozilla.com/apps/oldsync';
const SCOPE_RELAY = 'https://identity.mozilla.com/apps/relay';

const USER_ID = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');
const CLIENT_ID = Buffer.from('5882386c6d801776', 'hex');
const CLIENT_ID_HEX = '5882386c6d801776';
const NOW = 1_700_000_000_000;
const THROTTLE_MS = 86_400_000;

describe('recordActivity', () => {
  let oauthDB: { recordAccountActivity: jest.Mock };
  let statsd: { increment: jest.Mock };
  let log: { warn: jest.Mock };

  function makeDeps() {
    oauthDB = {
      recordAccountActivity: jest.fn().mockResolvedValue({ missingScopes: [] }),
    };
    statsd = { increment: jest.fn() };
    log = { warn: jest.fn() };
    return { oauthDB, statsd, log };
  }

  it('calls the DB with the user, client, and the scopes from the grant', async () => {
    const deps = makeDeps();
    await recordActivity(deps, {
      userId: USER_ID,
      clientId: CLIENT_ID,
      scopeSet: ScopeSet.fromArray([SCOPE_OLDSYNC, SCOPE_RELAY, 'profile']),
      throttleMs: THROTTLE_MS,
      grantType: 'fxa-credentials',
      now: NOW,
    });

    expect(deps.oauthDB.recordAccountActivity).toHaveBeenCalledTimes(1);
    const [userId, clientId, scopes, now, throttleMs] =
      deps.oauthDB.recordAccountActivity.mock.calls[0];
    expect(userId).toBe(USER_ID);
    expect(clientId).toBe(CLIENT_ID);
    expect(scopes).toEqual(
      expect.arrayContaining([SCOPE_OLDSYNC, SCOPE_RELAY, 'profile'])
    );
    expect(scopes).toHaveLength(3);
    expect(now).toBe(NOW);
    expect(throttleMs).toBe(THROTTLE_MS);
  });

  it('passes an empty scopes array when the grant has no scopes', async () => {
    const deps = makeDeps();
    await recordActivity(deps, {
      userId: USER_ID,
      clientId: CLIENT_ID,
      scopeSet: null,
      throttleMs: THROTTLE_MS,
      grantType: 'authorization_code',
      now: NOW,
    });

    expect(deps.oauthDB.recordAccountActivity).toHaveBeenCalledWith(
      USER_ID,
      CLIENT_ID,
      [],
      NOW,
      THROTTLE_MS
    );
  });

  it('emits accountActivity.recorded with clientId and grantType tags on success', async () => {
    const deps = makeDeps();
    await recordActivity(deps, {
      userId: USER_ID,
      clientId: CLIENT_ID,
      scopeSet: ScopeSet.fromArray([SCOPE_OLDSYNC]),
      throttleMs: THROTTLE_MS,
      grantType: 'fxa-credentials',
      now: NOW,
    });

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountActivity.recorded',
      { clientId: CLIENT_ID_HEX, grantType: 'fxa-credentials' }
    );
  });

  it("tags an unspecified grantType as 'unknown' in the metric", async () => {
    const deps = makeDeps();
    await recordActivity(deps, {
      userId: USER_ID,
      clientId: CLIENT_ID,
      scopeSet: ScopeSet.fromArray([SCOPE_OLDSYNC]),
      throttleMs: THROTTLE_MS,
      now: NOW,
    });

    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountActivity.recorded',
      { clientId: CLIENT_ID_HEX, grantType: 'unknown' }
    );
  });

  it('reports missing scopes to statsd and the log while still recording', async () => {
    const deps = makeDeps();
    deps.oauthDB.recordAccountActivity.mockResolvedValueOnce({
      missingScopes: [SCOPE_RELAY],
    });

    await recordActivity(deps, {
      userId: USER_ID,
      clientId: CLIENT_ID,
      scopeSet: ScopeSet.fromArray([SCOPE_OLDSYNC, SCOPE_RELAY]),
      throttleMs: THROTTLE_MS,
      grantType: 'fxa-credentials',
      now: NOW,
    });

    // The resolved scopes are still recorded.
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountActivity.recorded',
      { clientId: CLIENT_ID_HEX, grantType: 'fxa-credentials' }
    );
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountActivity.missing_scopes',
      { clientId: CLIENT_ID_HEX, grantType: 'fxa-credentials' }
    );
    expect(deps.log.warn).toHaveBeenCalledWith(
      'accountActivity.missing_scopes',
      {
        clientId: CLIENT_ID_HEX,
        grantType: 'fxa-credentials',
        missingScopes: [SCOPE_RELAY],
      }
    );
  });

  it('does not record or warn on missing scopes when every scope resolved', async () => {
    const deps = makeDeps();
    deps.oauthDB.recordAccountActivity.mockResolvedValueOnce({
      missingScopes: [],
    });

    await recordActivity(deps, {
      userId: USER_ID,
      clientId: CLIENT_ID,
      scopeSet: ScopeSet.fromArray([SCOPE_OLDSYNC]),
      throttleMs: THROTTLE_MS,
      grantType: 'fxa-credentials',
      now: NOW,
    });

    expect(deps.statsd.increment).not.toHaveBeenCalledWith(
      'accountActivity.missing_scopes',
      expect.anything()
    );
    expect(deps.log.warn).not.toHaveBeenCalled();
  });

  it('swallows DB rejection and emits write_failed instead of recorded', async () => {
    const deps = makeDeps();
    deps.oauthDB.recordAccountActivity.mockRejectedValueOnce(
      new Error('connection lost')
    );

    await expect(
      recordActivity(deps, {
        userId: USER_ID,
        clientId: CLIENT_ID,
        scopeSet: ScopeSet.fromArray([SCOPE_OLDSYNC]),
        throttleMs: THROTTLE_MS,
        grantType: 'refresh_token',
        now: NOW,
      })
    ).resolves.toBeUndefined();

    expect(deps.statsd.increment).toHaveBeenCalledTimes(1);
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accountActivity.write_failed',
      { clientId: CLIENT_ID_HEX, grantType: 'refresh_token' }
    );
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    const [reportedError] = mockCaptureException.mock.calls[0];
    expect(reportedError).toBeInstanceOf(Error);
    expect((reportedError as Error).message).toBe('connection lost');
  });

  it('tags the Sentry report with clientId, grantType, and scopes for debugging', async () => {
    const deps = makeDeps();
    deps.oauthDB.recordAccountActivity.mockRejectedValueOnce(
      new Error('connection lost')
    );

    await recordActivity(deps, {
      userId: USER_ID,
      clientId: CLIENT_ID,
      scopeSet: ScopeSet.fromArray([SCOPE_OLDSYNC, SCOPE_RELAY]),
      throttleMs: THROTTLE_MS,
      grantType: 'refresh_token',
      now: NOW,
    });

    expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { clientId: CLIENT_ID_HEX, grantType: 'refresh_token' },
      extra: { scopes: expect.arrayContaining([SCOPE_OLDSYNC, SCOPE_RELAY]) },
    });
  });

  it('filters out empty/non-string scope values defensively', async () => {
    const deps = makeDeps();
    // ScopeSet won't normally accept malformed values, but the helper
    // defends in depth so a bad upstream change can't poison the mapping
    // table with empty rows.
    const fakeScopeSet = {
      getScopeValues: () =>
        [SCOPE_OLDSYNC, '', null as any, undefined as any, 'profile'] as any,
    };
    await recordActivity(deps, {
      userId: USER_ID,
      clientId: CLIENT_ID,
      scopeSet: fakeScopeSet,
      throttleMs: THROTTLE_MS,
      grantType: 'authorization_code',
      now: NOW,
    });

    const [, , scopes] = deps.oauthDB.recordAccountActivity.mock.calls[0];
    expect(scopes).toEqual([SCOPE_OLDSYNC, 'profile']);
  });
});
