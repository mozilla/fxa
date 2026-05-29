/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { PASSKEY_TROUBLESHOOT_URL } from './constants';

export const unsupportedPasskeyMessage = (): ReactNode => (
  <>
    <FtlMsg id="passkey-registration-error-not-supported-v3">
      <span>
        This device couldn’t complete the passkey setup. Try another device or
        method.
      </span>
    </FtlMsg>{' '}
    <FtlMsg id="passkey-registration-error-not-supported-link">
      <LinkExternal
        href={PASSKEY_TROUBLESHOOT_URL}
        className="link-blue"
        gleanDataAttrs={{
          id: 'account_pref_passkey_create_help_not_supported',
        }}
      >
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);

/**
 * NotAllowedError + AbortError: the anti-fingerprinting catch-all (cancel,
 * dismiss, UV failure, no suitable authenticator, etc.). In-page Cancel is
 * intercepted upstream by PagePasskeyAdd's wasCanceled guard; see
 * webauthn-errors.ts ERROR_MAP[AbortError] for what else can land here.
 */
export const notAllowedPasskeyMessage = (): ReactNode => (
  <>
    <FtlMsg id="passkey-registration-error-not-allowed-v2">
      <span>Passkey setup couldn’t be completed.</span>
    </FtlMsg>{' '}
    <FtlMsg id="passkey-registration-error-not-allowed-link">
      <LinkExternal
        href={PASSKEY_TROUBLESHOOT_URL}
        className="link-blue"
        gleanDataAttrs={{ id: 'account_pref_passkey_create_help_not_allowed' }}
      >
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);

/** TimeoutError — surfaces only on browsers that distinguish it from NotAllowedError. */
export const timeoutPasskeyMessage = (): ReactNode => (
  <>
    <FtlMsg id="passkey-registration-error-timeout-v2">
      <span>Passkey setup timed out.</span>
    </FtlMsg>{' '}
    <FtlMsg id="passkey-registration-error-timeout-link">
      <LinkExternal
        href={PASSKEY_TROUBLESHOOT_URL}
        className="link-blue"
        gleanDataAttrs={{ id: 'account_pref_passkey_create_help_timeout' }}
      >
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);
