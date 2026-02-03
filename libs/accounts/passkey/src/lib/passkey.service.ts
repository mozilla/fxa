/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';
import { PasskeyManager } from './passkey.manager';

/**
 * PasskeyService - High-level business logic for passkey (WebAuthn) operations.
 *
 * This service handles the orchestration of passkey authentication flows including:
 * - Passkey registration (attestation)
 * - Passkey authentication (assertion)
 * - Passkey management (list, rename, delete)
 * - Challenge generation and verification
 *
 */
@Injectable()
export class PasskeyService {
  constructor(
    private readonly passkeyManager: PasskeyManager,
    @Inject(StatsDService) private readonly metrics: StatsD,
    @Inject(LOGGER_PROVIDER) private readonly log?: LoggerService
  ) {}

  // TODO: Add methods for passkey operations such as:
  // - generateRegistrationChallenge
  // - verifyRegistrationResponse
  // - generateAuthenticationChallenge
  // - verifyAuthenticationResponse
  // - listPasskeysForUser
  // - renamePasskey
  // - deletePasskey
}
