/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as isA from 'joi';
import { Container } from 'typedi';
import {
  PasskeyService,
  V1_WIDTHS,
  encodePasskeyWrapEnvelope,
  type NewPasskeyWrapData,
} from '@fxa/accounts/passkey';
import { AppError } from '@fxa/accounts/errors';
import { AuthRequest } from '../types';
import { ConfigType } from '../../config';
import { isPasskeyPasswordlessSyncEnabled } from '../passkey-utils';
import { recordSecurityEvent } from './utils/security-event';
import type { SecurityEventNames } from 'fxa-shared/db/models/auth/security-event';
import { reportSentryError } from '../sentry';
import { base64urlCredentialId, base64urlString } from './passkeys';
import type { Customs, DB } from './passkeys';
import PASSKEYS_API_DOCS from '../../docs/swagger/passkeys-api';

/**
 * A base64url string of exactly `bytes` decoded bytes. Every v1 width has one
 * legal character count, so the length is the whole check.
 */
const base64urlBytes = (bytes: number) => {
  const chars = Math.ceil((bytes * 4) / 3);
  return base64urlString(chars).length(chars);
};

/**
 * One required field per envelope width, built from the widths themselves so a
 * v2 field cannot reach the handler unvalidated.
 */
const envelopeSchema = Object.fromEntries(
  Object.entries(V1_WIDTHS).map(([name, bytes]) => [
    name,
    base64urlBytes(bytes).required(),
  ])
);

/**
 * The stored wrap as it arrives on the wire: the same fields, base64url-encoded
 * rather than binary. Keyed off the stored shape, so a new field cannot be
 * added without a payload entry.
 */
type WrapPayload = Record<keyof NewPasskeyWrapData, string>;

/**
 * Whether the token's credential names the credential being acted on.
 */
function isBoundTo(cid: string | undefined, credentialId: string): boolean {
  return (
    !!cid &&
    Buffer.from(cid, 'base64url').equals(Buffer.from(credentialId, 'base64url'))
  );
}

/**
 * Whether a wrap seals a `kB` the account has since replaced.
 *
 * Inverted so a `NaN` keysChangedAt withholds rather than serves.
 */
export function isWrapStale(createdAt: number, keysChangedAt: number): boolean {
  return !(createdAt >= keysChangedAt);
}

/**
 * Handlers for the passkey wrap endpoints. The envelopes that let a passkey
 * unlock `kB`.
 */
export class PasskeyWrapsHandler {
  constructor(
    private readonly service: PasskeyService,
    private readonly db: DB,
    private readonly customs: Customs
  ) {}

  /**
   * Handles `POST /passkey/wraps`.
   *
   * Creates the wrap for a credential that has none. There is no update path,
   * so a stale wrap is resolved by deleting the passkey and re-enrolling.
   *
   * Requires an `mfa:passkey` token bound to the credential being written.
   *
   * @returns `{ created: boolean }` — false when an identical wrap was already
   *   stored.
   */
  async createPasskeyWrap(request: AuthRequest) {
    const { uid, cid } = request.auth.credentials as {
      uid: string;
      cid?: string;
    };
    const payload = request.payload as WrapPayload;
    const { credentialId } = payload;

    if (!isBoundTo(cid, credentialId)) {
      await this.recordEvent(request, 'account.passkey.wrap_creation_failure');
      throw AppError.invalidMfaToken();
    }

    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.primaryEmail.email,
      'passkeyWrapsCreate'
    );

    let result: 'created' | 'unchanged';
    try {
      result = await this.service.storePasskeyWrap(
        uid,
        credentialId,
        {
          pkR: Buffer.from(payload.pkR, 'base64url'),
          prfWrappedSkR: Buffer.from(payload.prfWrappedSkR, 'base64url'),
          keyWrapIv: Buffer.from(payload.keyWrapIv, 'base64url'),
          hpkeEncapsulatedSecret: Buffer.from(
            payload.hpkeEncapsulatedSecret,
            'base64url'
          ),
          hpkeSealedKb: Buffer.from(payload.hpkeSealedKb, 'base64url'),
        },
        Date.now()
      );
    } catch (err) {
      await this.recordEvent(request, 'account.passkey.wrap_creation_failure');
      throw err;
    }

    if (result === 'unchanged') {
      return { created: false };
    }

    // Guarded like the failure path: the row is already committed, so a failed
    // audit write must not turn a stored wrap into a 500 the client retries —
    // the retry answers `created: false` and the event is never emitted at all.
    await this.recordEvent(request, 'account.passkey.wrap_created');

    return { created: true };
  }

  /**
   * Handles `GET /passkey/wraps/{credentialId}`.
   *
   * Returns the envelope for one credential so the client can unseal `kB`
   * without a password. The server cannot read it: the sealed key and the
   * PRF-wrapped private key are opaque here.
   *
   * Bound to the asserted credential as the write is. A wrap should only ever
   * be fetched to complete a sign-in with that same credential.
   *
   * Both `wrap_retrieved` and `wrap_retrieval_failure` land on every
   * passwordless sign-in, so both are kept out of the settings activity list
   * by `HIDDEN_SECURITY_EVENT_NAMES` in fxa-settings.
   *
   * @returns The base64url envelope plus the time it was stored.
   */
  async getPasskeyWrap(request: AuthRequest) {
    const { uid, cid } = request.auth.credentials as {
      uid: string;
      cid?: string;
    };
    const { credentialId } = request.params as { credentialId: string };

    if (!isBoundTo(cid, credentialId)) {
      await this.recordEvent(request, 'account.passkey.wrap_retrieval_failure');
      throw AppError.invalidMfaToken();
    }

    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.primaryEmail.email,
      'passkeyWrapsGet'
    );

    // Throws 404 for both an unknown credential (errno 224) and a credential
    // with no wrap (errno 234); the distinction is PasskeyService's contract.
    let wrap: Awaited<ReturnType<PasskeyService['getPasskeyWrap']>>;
    try {
      wrap = await this.service.getPasskeyWrap(uid, credentialId);
    } catch (err) {
      await this.recordEvent(request, 'account.passkey.wrap_retrieval_failure');
      throw err;
    }

    if (isWrapStale(wrap.createdAt, account.keysChangedAt)) {
      await this.recordEvent(request, 'account.passkey.wrap_retrieval_failure');
      throw AppError.passkeyWrapStale();
    }

    await this.recordEvent(request, 'account.passkey.wrap_retrieved');

    return {
      ...encodePasskeyWrapEnvelope(wrap),
      createdAt: wrap.createdAt,
    };
  }

  /**
   * Records a security event without letting its failure escape.
   *
   * On the failure path this runs on the way out of a `throw` and must not
   * replace the error that caused it; on the success path the row is already
   * committed. Reported to Sentry so an audit-write outage is not silent.
   */
  private async recordEvent(request: AuthRequest, name: SecurityEventNames) {
    try {
      await recordSecurityEvent(name, {
        db: this.db,
        request,
      });
    } catch (err) {
      reportSentryError(err, request);
    }
  }
}

/**
 * Builds the passkey wrap routes.
 *
 * Gated on `passkeys.passwordlessSyncEnabled` rather than the management flag.
 */
export const passkeyWrapsRoutes = (
  customs: Customs,
  db: DB,
  config: ConfigType,
  log: any
) => {
  const passwordlessSyncEnabledCheck = () =>
    isPasskeyPasswordlessSyncEnabled(config);

  if (!Container.has(PasskeyService)) {
    throw new Error(
      'Could not register passkey wrap routes. PasskeyService not registered with DI.'
    );
  }
  const handler = new PasskeyWrapsHandler(
    Container.get(PasskeyService),
    db,
    customs
  );

  return [
    {
      method: 'POST',
      path: '/passkey/wraps',
      options: {
        ...PASSKEYS_API_DOCS.PASSKEY_WRAPS_POST,
        pre: [{ method: passwordlessSyncEnabledCheck }],
        auth: {
          strategy: 'mfa',
          scope: ['mfa:passkey'],
          payload: false,
        },
        validate: {
          payload: isA.object({
            credentialId: base64urlCredentialId().required(),
            ...envelopeSchema,
          }),
        },
        response: {
          schema: isA.object({
            created: isA.boolean().required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('passkey.wraps.create', request);
        return handler.createPasskeyWrap(request);
      },
    },
    {
      method: 'GET',
      path: '/passkey/wraps/{credentialId}',
      options: {
        ...PASSKEYS_API_DOCS.PASSKEY_WRAPS_GET,
        pre: [{ method: passwordlessSyncEnabledCheck }],
        auth: {
          strategy: 'mfa',
          scope: ['mfa:passkey'],
          payload: false,
        },
        validate: {
          params: isA.object({
            credentialId: base64urlCredentialId().required(),
          }),
        },
        response: {
          schema: isA.object({
            ...envelopeSchema,
            createdAt: isA.number().required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('passkey.wraps.get', request);
        return handler.getPasskeyWrap(request);
      },
    },
  ];
};

export default passkeyWrapsRoutes;
