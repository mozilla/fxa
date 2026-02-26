/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import type {
  AuthenticatorAttachment,
  ResidentKeyRequirement,
  UserVerificationRequirement,
} from '@simplewebauthn/server';

/**
 * Configuration for passkey (WebAuthn) functionality.
 *
 * This configuration is loaded from Convict in auth-server's config/index.ts
 * and passed to PasskeyService constructor.
 */
export class PasskeyConfig {
  /**
   * Feature flag to enable/disable passkey functionality.
   */
  @IsBoolean()
  public enabled?: boolean;

  /**
   * WebAuthn Relying Party ID (must match the domain).
   * @example 'accounts.firefox.com'
   */
  @IsString()
  public rpId!: string;

  /**
   * WebAuthn Relying Party display name.
   * @example 'Mozilla Accounts'
   */
  @IsString()
  public rpName!: string;

  /**
   * Allowed origins for WebAuthn credential creation and authentication.
   * Must include protocol and domain.
   * @example ['https://accounts.firefox.com', 'https://accounts.stage.mozaws.net']
   */
  @IsArray()
  public allowedOrigins!: Array<string>;

  /**
   * Maximum number of passkeys a user can register.
   */
  @IsNumber()
  public maxPasskeysPerUser?: number;

  /**
   * Challenge expiration timeout in milliseconds.
   * @example 300000 (5 minutes)
   */
  @IsNumber()
  public challengeTimeout?: number;

  /**
   * User verification requirement for WebAuthn.
   * - 'required': User verification must occur (e.g., biometric, PIN)
   * - 'preferred': User verification preferred but not required
   * - 'discouraged': User verification should not occur
   * @example 'required'
   */
  @IsOptional()
  @IsIn(['required', 'preferred', 'discouraged'])
  public userVerification?: UserVerificationRequirement;

  /**
   * Resident key (discoverable credential) requirement.
   * - 'required': Credential must be discoverable (stored on authenticator).
   *   Must be set to 'required' for the passwordless / usernameless sign-in
   *   flow — non-discoverable credentials cannot be surfaced by the browser
   *   without a prior username.
   * - 'preferred': Discoverable credential preferred but not required
   * - 'discouraged': Non-discoverable credential preferred
   * @example 'required'
   */
  @IsOptional()
  @IsIn(['required', 'preferred', 'discouraged'])
  public residentKey?: ResidentKeyRequirement;

  /**
   * Authenticator attachment preference.
   * - 'platform': Platform authenticators (built into device, like Touch ID)
   * - 'cross-platform': Roaming authenticators (USB security keys)
   * - undefined: No preference (allow any)
   */
  @IsOptional()
  @IsIn(['platform', 'cross-platform'])
  public authenticatorAttachment?: AuthenticatorAttachment;
}
