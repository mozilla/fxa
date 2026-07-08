/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Integration, IntegrationType } from '../../models';
import { isOAuthIntegration } from '../../models';
import type { AuthContext } from './types';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';

export interface BuildContextInput {
  /**
   * Pick only the methods/properties we actually read from Integration.
   * isOAuth is a standalone function in the real codebase, but test stubs may
   * supply it as a method; we accept it optionally here and fall back to
   * isOAuthIntegration() for real Integration instances.
   */
  integration: Pick<
    Integration,
    | 'isSync'
    | 'isFirefoxNonSync'
    | 'type'
    | 'requiresKeys'
    | 'wantsKeysIfPasswordEntered'
    | 'wantsLogin'
    | 'clientInfoLoadFailed'
  > & {
    /** Optional: test stubs may provide this; real Integration instances do not. */
    isOAuth?: () => boolean;
  };
  stored: {
    email?: string;
    uid?: string;
    sessionToken?: string;
    hasPassword?: boolean;
    emailVerified?: boolean;
    sessionVerified?: boolean;
  };
  live: {
    accountHasTotp?: boolean;
    hasCachedSession?: boolean;
    supportsKeysOptionalLogin?: boolean;
    hasRecoveryPhone?: boolean;
    hasLinkedAccount?: boolean;
    passwordlessSupported?: boolean;
    verificationMethod?: VerificationMethods;
    verificationReason?: VerificationReasons;
  };
}

export function buildAuthContext(input: BuildContextInput): AuthContext {
  const { integration: i, stored, live } = input;
  const integrationType = i.type as IntegrationType | string;
  // Support both stub-supplied isOAuth() and the real standalone helper.
  const oAuth =
    typeof i.isOAuth === 'function'
      ? i.isOAuth()
      : isOAuthIntegration(i as Integration);

  return {
    email: stored.email,
    uid: stored.uid,
    sessionToken: stored.sessionToken,
    emailVerified: stored.emailVerified ?? false,
    sessionVerified: stored.sessionVerified ?? false,
    verificationMethod: live.verificationMethod,
    verificationReason: live.verificationReason,
    accountHasTotp: live.accountHasTotp ?? false,
    hasRecoveryPhone: live.hasRecoveryPhone ?? false,
    hasPassword: stored.hasPassword ?? true,
    hasLinkedAccount: live.hasLinkedAccount ?? false,
    hasCachedSession: live.hasCachedSession ?? false,
    passwordlessSupported: live.passwordlessSupported ?? false,
    isOAuth: oAuth,
    isOAuthWeb: integrationType === 'OAuthWeb',
    isOAuthNative: integrationType === 'OAuthNative',
    isSync: i.isSync(),
    isWebChannelIntegration: i.isSync() || i.isFirefoxNonSync(),
    supportsKeysOptionalLogin: live.supportsKeysOptionalLogin ?? false,
    requiresKeys: i.requiresKeys(),
    wantsKeysIfPasswordEntered: i.wantsKeysIfPasswordEntered(),
    wantsLogin: i.wantsLogin(),
    clientInfoLoadFailed: i.clientInfoLoadFailed ?? false,
  };
}
