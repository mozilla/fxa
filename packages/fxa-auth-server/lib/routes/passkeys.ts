/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as isA from 'joi';
import { Container } from 'typedi';
import { PasskeyService } from '@fxa/accounts/passkey';
import { AuthRequest } from '../types';
import { recordSecurityEvent } from './utils/security-event';
import { ConfigType } from '../../config';
import {
  isPasskeyFeatureEnabled,
  isPasskeyRegistrationEnabled,
} from '../passkey-utils';
import { GleanMetricsType } from '../metrics/glean';
import PASSKEYS_API_DOCS from '../../docs/swagger/passkeys-api';
import { RegistrationResponseJSON } from '@simplewebauthn/server';
import { FxaMailer } from '../senders/fxa-mailer';
import { FxaMailerFormat } from '../senders/fxa-mailer-format';
import { reportSentryError } from '../sentry';

/** Subset of the Customs service used by passkey routes. */
interface Customs {
  /**
   * Enforces rate-limiting for an authenticated action.
   * Throws an AppError if the user or IP is throttled.
   */
  checkAuthenticated: (
    req: AuthRequest,
    uid: string,
    email: string,
    action: string
  ) => Promise<void>;
}

/** Subset of the database used by passkey routes. */
interface DB {
  /** Fetches the account record for the given UID. */
  account(uid: string): Promise<{
    email: string;
    emailCode: string;
    emailVerified: boolean;
    verifierSetAt: number;
  }>;
  /** Creates a new session token and persists it. */
  createSessionToken(options: {
    uid: string;
    email: string;
    emailCode: string;
    emailVerified: boolean;
    verifierSetAt: number;
    mustVerify: boolean;
    tokenVerificationId: string | null;
    uaBrowser?: string;
    uaBrowserVersion?: string;
    uaOS?: string;
    uaOSVersion?: string;
    uaDeviceType?: string;
    uaFormFactor?: string;
  }): Promise<{ id: string }>;
  /** Sets the verification method on a session token. */
  verifyTokensWithMethod(
    tokenId: string,
    method: string | number
  ): Promise<void>;
  /** Deletes a session token. Used for cleanup on partial failure. */
  deleteSessionToken(token: { id: string; uid: string }): Promise<void>;
  /** Records a security event in the audit log. */
  securityEvent: (arg: any) => Promise<void>;
}

/**
 * Route handler class that encapsulates the WebAuthn registration flow
 * and passkey management operations.
 *
 * Each method corresponds to one HTTP endpoint and is responsible for:
 * - Feature-flag gating
 * - Rate-limit enforcement via Customs
 * - Delegating business logic to {@link PasskeyService}
 * - Recording security audit events
 */
export class PasskeyHandler {
  constructor(
    private readonly service: PasskeyService,
    private readonly db: DB,
    private readonly customs: Customs,
    private readonly log: any,
    private readonly fxaMailer: FxaMailer,
    private readonly statsd: any
    // TODO: FXA-12914 - Require glean be passed in.
  ) {}

  /**
   * Handles `POST /passkey/registration/start`.
   *
   * Verifies the service is enabled, enforces rate-limiting, and delegates to
   * {@link PasskeyService.generateRegistrationChallenge} to produce
   * `PublicKeyCredentialCreationOptions` for the browser.
   *
   * @param request - Authenticated Hapi request with a valid MFA JWT.
   * @returns WebAuthn registration options to pass to `navigator.credentials.create`.
   */
  async registrationStart(request: AuthRequest) {
    const { uid } = request.auth.credentials as {
      uid: string;
    };

    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.email,
      'passkeyRegisterStart'
    );

    const options = await this.service.generateRegistrationChallenge(
      Buffer.from(uid),
      account.email
    );

    // TODO: FXA-12914 — Glean event name needs to be defined in the Glean schema
    // await this.glean.passkey.registrationStarted(request);

    return options;
  }

  /**
   * Handles `POST /passkey/registration/finish`.
   *
   * Verifies the service is enabled, enforces rate-limiting, and delegates to
   * {@link PasskeyService.createPasskeyFromRegistrationResponse} to verify the
   * attestation and persist the new credential. Records a security event for
   * both success and failure outcomes.
   *
   * @param request - Authenticated Hapi request containing `response` and
   *   `challenge` in the payload.
   * @returns A subset of the new passkey record: `credentialId`, `name`,
   *   `createdAt`, `lastUsedAt`, and `transports`.
   */
  async registrationFinish(request: AuthRequest) {
    const { uid } = request.auth.credentials as {
      uid: string;
    };

    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.email,
      'passkeyRegisterFinish'
    );

    const { response, challenge } = request.payload as {
      response: RegistrationResponseJSON;
      challenge: string;
    };

    try {
      const passkey = await this.service.createPasskeyFromRegistrationResponse(
        Buffer.from(uid),
        response,
        challenge
      );

      await recordSecurityEvent('account.passkey.registration_success', {
        db: this.db,
        request,
      });

      // TODO: FXA-12914 — Glean event name needs to be defined in the Glean schema
      // await this.glean.passkey.registrationComplete(request);

      try {
        if (this.fxaMailer.canSend('postAddPasskey')) {
          await this.fxaMailer.sendPostAddPasskeyEmail({
            ...FxaMailerFormat.account({ ...account, uid }),
            ...(await FxaMailerFormat.metricsContext(request)),
            ...FxaMailerFormat.localTime(request),
            ...FxaMailerFormat.location(request),
            ...FxaMailerFormat.device(request),
            ...FxaMailerFormat.sync(false),
            showSyncPasswordNote: account.verifierSetAt > 0,
          });
        }
      } catch (err) {
        this.log.error('passkeys.registrationFinish.sendEmail', { err });
        reportSentryError(err, request);
      }

      const {
        credentialId,
        name,
        createdAt,
        lastUsedAt,
        transports,
        aaguid,
        backupEligible,
        backupState,
        prfEnabled,
      } = passkey;

      return {
        credentialId: credentialId.toString('base64url'),
        name,
        createdAt,
        lastUsedAt,
        transports,
        aaguid: aaguid.toString('base64url'),
        backupEligible,
        backupState,
        prfEnabled,
      };
    } catch (err) {
      await recordSecurityEvent('account.passkey.registration_failure', {
        db: this.db,
        request,
      });

      // TODO: FXA-12914 — Glean event name needs to be defined in the Glean schema
      // await this.glean.passkey.registrationFailed(request);

      throw err;
    }
  }

  /**
   * Handles `GET /passkeys`.
   *
   * Lists all passkeys registered for the authenticated user.
   *
   * @param request - Authenticated Hapi request with a valid session token.
   * @returns Array of passkey metadata objects.
   */
  async listPasskeys(request: AuthRequest) {
    const { uid } = request.auth.credentials as { uid: string };

    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.email,
      'passkeysList'
    );

    const passkeys = await this.service.listPasskeysForUser(Buffer.from(uid));

    // omit publicKey and signCount
    return passkeys.map(
      ({
        credentialId,
        name,
        createdAt,
        lastUsedAt,
        transports,
        aaguid,
        backupEligible,
        backupState,
        prfEnabled,
      }) => ({
        credentialId: credentialId.toString('base64url'),
        name,
        createdAt,
        lastUsedAt,
        transports,
        aaguid: aaguid.toString('base64url'),
        backupEligible,
        backupState,
        prfEnabled,
      })
    );
  }

  /**
   * Handles `DELETE /passkey/:credentialId`.
   *
   * Deletes the passkey with `credentialId`.
   *
   * @param request - Authenticated Hapi request with a valid MFA JWT.
   */
  async deletePasskey(request: AuthRequest) {
    const { uid } = request.auth.credentials as { uid: string };
    const { credentialId: credentialIdParam } = request.params as {
      credentialId: string;
    };

    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.email,
      'passkeyDelete'
    );

    const credentialId = Buffer.from(credentialIdParam, 'base64url');

    await this.service.deletePasskey(Buffer.from(uid), credentialId);

    await recordSecurityEvent('account.passkey.removed', {
      db: this.db,
      request,
    });

    // TODO: FXA-12914 — Glean event name needs to be defined in the Glean schema
    // await this.glean.passkey.deleteSuccess(request, { uid });

    try {
      if (this.fxaMailer.canSend('postRemovePasskey')) {
        await this.fxaMailer.sendPostRemovePasskeyEmail({
          ...FxaMailerFormat.account({ ...account, uid }),
          ...(await FxaMailerFormat.metricsContext(request)),
          ...FxaMailerFormat.localTime(request),
          ...FxaMailerFormat.location(request),
          ...FxaMailerFormat.device(request),
          ...FxaMailerFormat.sync(false),
        });
      }
    } catch (err) {
      this.log.error('passkeys.deletePasskey.sendEmail', { err });
      reportSentryError(err, request);
    }

    return {};
  }

  /**
   * Handles `PATCH /passkey/:credentialId`.
   *
   * @param request - Authenticated Hapi request with a valid MFA JWT.
   * @returns Updated passkey metadata object.
   */
  async renamePasskey(request: AuthRequest) {
    const { uid } = request.auth.credentials as { uid: string };
    const { credentialId: credentialIdParam } = request.params as {
      credentialId: string;
    };
    const { name } = request.payload as { name: string };

    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.email,
      'passkeysRename'
    );

    const credentialId = Buffer.from(credentialIdParam, 'base64url');

    const passkey = await this.service.renamePasskey(
      Buffer.from(uid),
      credentialId,
      name
    );

    // TODO: FXA-12914 — Glean event name needs to be defined in the Glean schema
    // await this.glean.passkey.renameSuccess(request, { uid });

    return {
      credentialId: passkey.credentialId.toString('base64url'),
      name: passkey.name,
      createdAt: passkey.createdAt,
      lastUsedAt: passkey.lastUsedAt,
      transports: passkey.transports,
      aaguid: passkey.aaguid.toString('base64url'),
      backupEligible: passkey.backupEligible,
      backupState: passkey.backupState,
      prfEnabled: passkey.prfEnabled,
    };
  }

  /**
   * Creates a passkey-verified session token for the authenticated account.
   *
   * No `tokenVerificationId` is set — the passkey assertion is itself AAL2, so
   * no follow-up email challenge is needed. After creation,
   * `verifyTokensWithMethod` stamps `verificationMethod = 5` (passkey) on the
   * row; the token's AMR becomes `{pwd, webauthn}` → AAL2.
   *
   * TODO(FXA-13444): this is a temporary two-step implementation. The create
   * and stamp will be replaced by a single atomic stored procedure.
   */
  async createPasskeySessionToken(
    account: {
      uid: string;
      email: string;
      emailCode: string;
      emailVerified: boolean;
      verifierSetAt: number;
    },
    request: AuthRequest
  ) {
    const sessionToken = await this.db.createSessionToken({
      uid: account.uid,
      email: account.email,
      emailCode: account.emailCode,
      emailVerified: account.emailVerified,
      verifierSetAt: account.verifierSetAt,
      mustVerify: false,
      tokenVerificationId: null,
      uaBrowser: request.app.ua.browser,
      uaBrowserVersion: request.app.ua.browserVersion,
      uaOS: request.app.ua.os,
      uaOSVersion: request.app.ua.osVersion,
      uaDeviceType: request.app.ua.deviceType,
      uaFormFactor: request.app.ua.formFactor,
    });

    try {
      await this.db.verifyTokensWithMethod(sessionToken.id, 'passkey');
    } catch (err) {
      // If stamping the verification method fails, delete the token rather than
      // leaving an orphan session at AAL1. If cleanup also fails, log and report
      // it but always re-throw the original error.
      // TODO(FXA-13444): remove this entire catch block once the atomic procedure lands.
      try {
        await this.db.deleteSessionToken({
          id: sessionToken.id,
          uid: account.uid,
        });
      } catch (cleanupErr) {
        this.log.error('passkeys.createPasskeySessionToken.deleteOrphan', {
          err: cleanupErr,
          tokenId: sessionToken.id,
        });
        reportSentryError(cleanupErr, request);
      }
      this.statsd.increment('passkeys.createSessionToken.failure');
      throw err;
    }

    this.statsd.increment('passkeys.createSessionToken.success');
    return sessionToken;
  }
}

/**
 * Registers all passkey-related Hapi routes.
 *
 * Retrieves the {@link PasskeyService} from the TypeDI container and wires it
 * into a {@link PasskeyHandler}.  Throws at startup if the service is not
 * registered, rather than failing silently at request time.
 *
 * @param customs - Customs service for rate-limiting.
 * @param db - Database client (minimal interface used by these routes).
 * @param config - Full application configuration.
 * @param statsd - StatsD client for metrics.
 * @param glean - Glean metrics instance.
 * @param log - Logger instance.
 * @returns An array of Hapi route configuration objects.
 */
export const passkeyRoutes = (
  customs: Customs,
  db: any,
  config: ConfigType,
  statsd: any,
  glean: GleanMetricsType,
  log: any
) => {
  // Passkey route flag hierarchy:
  //   passkeys.enabled (master switch) — gates management routes (list/delete/rename)
  //   + registrationEnabled            — gates registration routes
  //   + authenticationEnabled          — gates auth routes (TODO FXA-13095)
  const passkeysEnabledCheck = () => isPasskeyFeatureEnabled(config);
  const registrationEnabledCheck = () => isPasskeyRegistrationEnabled(config);

  const service = Container.get(PasskeyService);
  if (!service) {
    throw new Error(
      'Could not register passkey routes. PasskeyService not registered with DI.'
    );
  }
  const fxaMailer = Container.get(FxaMailer);
  const handler = new PasskeyHandler(
    service,
    db,
    customs,
    log,
    fxaMailer,
    statsd
  );

  return [
    {
      method: 'POST',
      path: '/passkey/registration/start',
      options: {
        ...PASSKEYS_API_DOCS.PASSKEY_REGISTRATION_START_POST,
        pre: [{ method: registrationEnabledCheck }],
        auth: {
          strategy: 'mfa',
          scope: ['mfa:passkey'],
          payload: false,
        },
        response: {
          schema: isA.object({
            rp: isA
              .object({
                id: isA.string().optional(),
                name: isA.string().required(),
              })
              .required(),
            user: isA
              .object({
                id: isA.string().required(),
                name: isA.string().required(),
                displayName: isA.string().required(),
              })
              .required(),
            challenge: isA.string().required(),
            pubKeyCredParams: isA
              .array()
              .items(
                isA.object({
                  alg: isA.number().required(),
                  type: isA.string().valid('public-key').required(),
                })
              )
              .required(),
            timeout: isA.number().optional(),
            excludeCredentials: isA
              .array()
              .items(
                isA.object({
                  id: isA.string().required(),
                  type: isA.string().valid('public-key').required(),
                  transports: isA
                    .array()
                    .items(
                      isA
                        .string()
                        .valid(
                          'ble',
                          'cable',
                          'hybrid',
                          'internal',
                          'nfc',
                          'smart-card',
                          'usb'
                        )
                    )
                    .optional(),
                })
              )
              .optional(),
            authenticatorSelection: isA
              .object({
                authenticatorAttachment: isA
                  .string()
                  .valid('cross-platform', 'platform')
                  .optional(),
                requireResidentKey: isA.boolean().optional(),
                residentKey: isA
                  .string()
                  .valid('discouraged', 'preferred', 'required')
                  .optional(),
                userVerification: isA
                  .string()
                  .valid('discouraged', 'preferred', 'required')
                  .optional(),
              })
              .optional(),
            hints: isA
              .array()
              .items(
                isA.string().valid('hybrid', 'security-key', 'client-device')
              )
              .optional(),
            attestation: isA
              .string()
              .valid('direct', 'enterprise', 'indirect', 'none')
              .optional(),
            attestationFormats: isA
              .array()
              .items(
                isA
                  .string()
                  .valid(
                    'fido-u2f',
                    'packed',
                    'android-safetynet',
                    'android-key',
                    'tpm',
                    'apple',
                    'none'
                  )
              )
              .optional(),
            extensions: isA
              .object({
                appid: isA.string().optional(),
                credProps: isA.boolean().optional(),
                hmacCreateSecret: isA.boolean().optional(),
                minPinLength: isA.boolean().optional(),
              })
              .optional(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('passkey.registration.start', request);
        return handler.registrationStart(request);
      },
    },
    {
      method: 'POST',
      path: '/passkey/registration/finish',
      options: {
        ...PASSKEYS_API_DOCS.PASSKEY_REGISTRATION_FINISH_POST,
        pre: [{ method: registrationEnabledCheck }],
        auth: {
          strategy: 'mfa',
          scope: ['mfa:passkey'],
          payload: false,
        },
        validate: {
          payload: isA.object({
            response: isA.object().required(),
            challenge: isA.string().required(),
          }),
        },
        response: {
          schema: isA.object({
            credentialId: isA.string().required(),
            name: isA.string().required(),
            createdAt: isA.number().required(),
            lastUsedAt: isA.number().allow(null).required(),
            transports: isA.array().items(isA.string()).required(),
            aaguid: isA.string().required(),
            backupEligible: isA.boolean().required(),
            backupState: isA.boolean().required(),
            prfEnabled: isA.boolean().required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('passkey.registration.finish', request);
        return handler.registrationFinish(request);
      },
    },
    {
      method: 'GET',
      path: '/passkeys',
      options: {
        ...PASSKEYS_API_DOCS.PASSKEYS_GET,
        pre: [{ method: passkeysEnabledCheck }],
        auth: {
          strategy: 'verifiedSessionToken',
          payload: false,
        },
        response: {
          schema: isA.array().items(
            isA.object({
              credentialId: isA.string().required(),
              name: isA.string().required(),
              createdAt: isA.number().required(),
              lastUsedAt: isA.number().allow(null).required(),
              transports: isA.array().items(isA.string()).required(),
              aaguid: isA.string().required(),
              backupEligible: isA.boolean().required(),
              backupState: isA.boolean().required(),
              prfEnabled: isA.boolean().required(),
            })
          ),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('passkey.list', request);
        return handler.listPasskeys(request);
      },
    },
    {
      method: 'DELETE',
      path: '/passkey/{credentialId}',
      options: {
        ...PASSKEYS_API_DOCS.PASSKEY_CREDENTIAL_DELETE,
        pre: [{ method: passkeysEnabledCheck }],
        auth: {
          strategy: 'mfa',
          scope: ['mfa:passkey'],
          payload: false,
        },
        validate: {
          params: isA.object({
            credentialId: isA.string().required(),
          }),
        },
        response: {
          schema: isA.object({}),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('passkey.delete', request);
        return handler.deletePasskey(request);
      },
    },
    {
      method: 'PATCH',
      path: '/passkey/{credentialId}',
      options: {
        ...PASSKEYS_API_DOCS.PASSKEY_CREDENTIAL_PATCH,
        pre: [{ method: passkeysEnabledCheck }],
        auth: {
          strategy: 'mfa',
          scope: ['mfa:passkey'],
          payload: false,
        },
        validate: {
          params: isA.object({
            credentialId: isA.string().required(),
          }),
          payload: isA.object({
            name: isA.string().min(1).max(255).required(),
          }),
        },
        response: {
          schema: isA.object({
            credentialId: isA.string().required(),
            name: isA.string().required(),
            createdAt: isA.number().required(),
            lastUsedAt: isA.number().allow(null).required(),
            transports: isA.array().items(isA.string()).required(),
            aaguid: isA.string().required(),
            backupEligible: isA.boolean().required(),
            backupState: isA.boolean().required(),
            prfEnabled: isA.boolean().required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('passkey.rename', request);
        return handler.renamePasskey(request);
      },
    },
  ];
};

export default passkeyRoutes;
