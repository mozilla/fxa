/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import type { StatsD } from 'hot-shots';
import type { PartialFuncReturn } from '@golevelup/ts-jest';
import { AppError, ERRNO } from '@fxa/accounts/errors';
import type { ConfigType } from '../../config';
import type { GleanMetricsType } from '../metrics/glean';
import { sign as signOAuthJwt } from '../oauth/jwt';
import type { AuthLogger, AuthRequest } from '../types';
import type { Customs, DB } from './passkeys';
import {
  ADMIN_ASSERTION_AUDIENCE,
  ADMIN_ASSERTION_TYP,
  DELETE_ASSERTION_SCOPE,
  syncDataRoutes,
} from './sync-data';
import { recordSecurityEvent } from './utils/security-event';

jest.mock('./utils/security-event', () => ({
  recordSecurityEvent: jest.fn(),
}));
// Loading the real module reads signing keys from config.
jest.mock('../oauth/jwt', () => ({
  sign: jest.fn().mockResolvedValue('signed-assertion'),
}));
jest.mock('../sentry', () => ({
  reportSentryError: jest.fn(),
}));

const UID = 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6';
const TEST_EMAIL = 'test@example.com';

const config = {
  syncDataDeletion: { enabled: true },
  syncTokenserverUrl: 'https://token.example.com/1.0/sync/1.5',
} as unknown as ConfigType;

type Route = ReturnType<typeof syncDataRoutes>[number];

const asRequest = (r: PartialFuncReturn<AuthRequest>) =>
  r as object as AuthRequest;

const tokenserverResponse = (status: number, body?: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    body: { cancel: async () => {} },
    json: async () => body,
  }) as unknown as Response;

describe('sync data routes', () => {
  let log: DeepMocked<AuthLogger>;
  let db: DeepMocked<DB>;
  let customs: DeepMocked<Customs>;
  let glean: DeepMocked<GleanMetricsType>;
  let statsd: DeepMocked<StatsD>;
  let fetchMock: jest.Mock;

  const buildRoute = (cfg: ConfigType = config) =>
    syncDataRoutes(customs, db, cfg, log, glean, statsd)[0] as Route;

  const SESSION_CREATED_AT = 1_700_000_000_000;

  // `reauthed` drives `authAt` relative to `createdAt`; the predicate itself
  // is unit-tested in session-reauth.spec.ts.
  const request = ({ reauthed = true } = {}) =>
    asRequest({
      headers: { 'user-agent': 'test-agent' },
      auth: {
        credentials: {
          uid: UID,
          id: 'session-token-id',
          createdAt: SESSION_CREATED_AT,
          authAt: reauthed ? SESSION_CREATED_AT + 1_000 : SESSION_CREATED_AT,
        },
      },
      app: { clientAddress: '127.0.0.1' },
    });

  const run = (opts?: { reauthed?: boolean }) =>
    buildRoute().handler(request(opts));

  beforeEach(() => {
    jest.clearAllMocks();
    log = createMock<AuthLogger>();
    db = createMock<DB>();
    db.account.mockResolvedValue({
      primaryEmail: { email: TEST_EMAIL },
    } as Awaited<ReturnType<DB['account']>>);
    customs = createMock<Customs>();
    customs.checkAuthenticated.mockResolvedValue(undefined);
    glean = createMock<GleanMetricsType>();
    statsd = createMock<StatsD>();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  it('requires an mfa:sync_data token', () => {
    const route = buildRoute();
    expect(route.path).toBe('/account/sync_data/destroy');
    expect(route.options.auth).toEqual({
      strategy: 'mfa',
      scope: ['mfa:sync_data'],
      payload: false,
    });
  });

  it('is disabled by config', () => {
    const route = buildRoute({
      ...config,
      syncDataDeletion: { enabled: false },
    } as ConfigType);
    const pre = route.options.pre[0].method as () => boolean;
    expect(() => pre()).toThrow(
      expect.objectContaining({ errno: ERRNO.FEATURE_NOT_ENABLED })
    );
  });

  it('rate limits before calling tokenserver', async () => {
    customs.checkAuthenticated.mockRejectedValue(AppError.tooManyRequests(1));

    await expect(run()).rejects.toMatchObject({
      errno: ERRNO.THROTTLED,
    });
    expect(customs.checkAuthenticated).toHaveBeenCalledWith(
      expect.anything(),
      UID,
      TEST_EMAIL,
      'syncDataDestroy'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requires the session to have verified the password', async () => {
    await expect(run({ reauthed: false })).rejects.toMatchObject({
      errno: ERRNO.PASSWORD_REAUTH_REQUIRED,
    });
    expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(recordSecurityEvent).not.toHaveBeenCalled();
  });

  it('deletes with a short-lived assertion tokenserver accepts', async () => {
    fetchMock.mockResolvedValue(tokenserverResponse(200, { deleted: true }));

    await expect(run()).resolves.toEqual({ deleted: true });

    expect(signOAuthJwt).toHaveBeenCalledWith(
      {
        sub: UID,
        aud: ADMIN_ASSERTION_AUDIENCE,
        scope: DELETE_ASSERTION_SCOPE,
        jti: expect.any(String),
      },
      { expiresIn: 30, header: { typ: ADMIN_ASSERTION_TYP } }
    );
    const [url, init] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe(
      `https://token.example.com/1.0/users/${UID}/storage`
    );
    expect(init.method).toBe('DELETE');
    expect(init.headers.authorization).toBe('Bearer signed-assertion');
    expect(recordSecurityEvent).toHaveBeenCalledWith(
      'account.sync_data_deleted',
      expect.objectContaining({ db })
    );
    expect(glean.syncData.deleteSuccess).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:deleted',
    ]);
    expect(statsd.timing).toHaveBeenCalledWith(
      'sync_data.destroy.tokenserver',
      expect.any(Number)
    );
  });

  it('reports nothing deleted when the user has no storage node', async () => {
    fetchMock.mockResolvedValue(tokenserverResponse(200, { deleted: false }));

    await expect(run()).resolves.toEqual({ deleted: false });
    expect(recordSecurityEvent).not.toHaveBeenCalled();
    expect(glean.syncData.deleteSuccess).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:nothing_to_delete',
    ]);
  });

  it('treats an unknown tokenserver user as nothing to delete', async () => {
    fetchMock.mockResolvedValue(
      tokenserverResponse(404, { status: 'error', errors: [] })
    );

    await expect(run()).resolves.toEqual({ deleted: false });
    expect(recordSecurityEvent).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:nothing_to_delete',
    ]);
  });

  it('fails on a 404 without the tokenserver error body', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      body: { cancel: async () => {} },
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input');
      },
    } as unknown as Response);

    await expect(run()).rejects.toMatchObject({
      errno: ERRNO.BACKEND_SERVICE_FAILURE,
    });
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:failed',
      'reason:http_404',
    ]);
  });

  it('treats any status other than 200 and 404 as a failure', async () => {
    fetchMock.mockResolvedValue(tokenserverResponse(202, { deleted: true }));

    await expect(run()).rejects.toMatchObject({
      errno: ERRNO.BACKEND_SERVICE_FAILURE,
    });
    expect(recordSecurityEvent).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:failed',
      'reason:http_202',
    ]);
  });

  it('fails when a successful response lacks a boolean deleted', async () => {
    fetchMock.mockResolvedValue(tokenserverResponse(200, { deleted: 'false' }));

    await expect(run()).rejects.toMatchObject({
      errno: ERRNO.BACKEND_SERVICE_FAILURE,
    });
    expect(recordSecurityEvent).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:failed',
      'reason:malformed_body',
    ]);
  });

  it('fails when a successful response has no usable body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input');
      },
    } as unknown as Response);

    await expect(run()).rejects.toMatchObject({
      errno: ERRNO.BACKEND_SERVICE_FAILURE,
    });
    expect(recordSecurityEvent).not.toHaveBeenCalled();
  });

  it('reports an error without a security event when tokenserver errors', async () => {
    fetchMock.mockResolvedValue(tokenserverResponse(503));

    await expect(run()).rejects.toMatchObject({
      errno: ERRNO.BACKEND_SERVICE_FAILURE,
    });
    expect(recordSecurityEvent).not.toHaveBeenCalled();
    expect(glean.syncData.deleteSuccess).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:failed',
      'reason:http_503',
    ]);
    expect(statsd.timing).toHaveBeenCalledWith(
      'sync_data.destroy.tokenserver',
      expect.any(Number)
    );
  });

  it('reports an error when tokenserver is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(run()).rejects.toMatchObject({
      errno: ERRNO.BACKEND_SERVICE_FAILURE,
    });
    expect(recordSecurityEvent).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:failed',
      'reason:connect',
    ]);
  });

  it('tags a timed-out tokenserver call', async () => {
    fetchMock.mockRejectedValue(
      new DOMException('The operation was aborted', 'TimeoutError')
    );

    await expect(run()).rejects.toMatchObject({
      errno: ERRNO.BACKEND_SERVICE_FAILURE,
    });
    expect(statsd.increment).toHaveBeenCalledWith('sync_data.destroy', [
      'result:failed',
      'reason:timeout',
    ]);
  });
});
