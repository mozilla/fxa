/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { PASSKEY_TROUBLESHOOT_URL } from './constants';

type PasskeyErrorMessage = {
  ftlId: string;
  fallbackText: ReactNode;
  linkFtlId: string;
  gleanId: string;
};

const renderPasskeyErrorMessage = ({
  ftlId,
  fallbackText,
  linkFtlId,
  gleanId,
}: PasskeyErrorMessage): ReactNode => (
  <>
    <FtlMsg id={ftlId}>
      <span>{fallbackText}</span>
    </FtlMsg>{' '}
    <FtlMsg id={linkFtlId}>
      <LinkExternal
        href={PASSKEY_TROUBLESHOOT_URL}
        className="link-blue"
        gleanDataAttrs={{ id: gleanId }}
      >
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);

export const unsupportedPasskeyMessage = (): ReactNode =>
  renderPasskeyErrorMessage({
    ftlId: 'passkey-registration-error-not-supported-v3',
    fallbackText:
      'This device couldn’t complete the passkey setup. Try another device or method.',
    linkFtlId: 'passkey-registration-error-not-supported-link',
    gleanId: 'account_pref_passkey_create_help_not_supported',
  });

/**
 * NotAllowedError + AbortError: the anti-fingerprinting catch-all (cancel,
 * dismiss, UV failure, no suitable authenticator, etc.). In-page Cancel is
 * intercepted upstream by PagePasskeyAdd's wasCanceled guard; see
 * webauthn-errors.ts ERROR_MAP[AbortError] for what else can land here.
 */
export const notAllowedPasskeyMessage = (): ReactNode =>
  renderPasskeyErrorMessage({
    ftlId: 'passkey-registration-error-not-allowed-v2',
    fallbackText: 'Passkey setup couldn’t be completed.',
    linkFtlId: 'passkey-registration-error-not-allowed-link',
    gleanId: 'account_pref_passkey_create_help_not_allowed',
  });

/** TimeoutError — surfaces only on browsers that distinguish it from NotAllowedError. */
export const timeoutPasskeyMessage = (): ReactNode =>
  renderPasskeyErrorMessage({
    ftlId: 'passkey-registration-error-timeout-v2',
    fallbackText: 'Passkey setup timed out.',
    linkFtlId: 'passkey-registration-error-timeout-link',
    gleanId: 'account_pref_passkey_create_help_timeout',
  });

/**
 * Firefox-only path: `NotAllowedError` raised after `excludeCredentials` was
 * sent. Firefox collapses user-cancel and duplicate-credential into the same
 * DOMException; when the account already has passkeys we lean toward the
 * duplicate interpretation. Chrome surfaces the same case as
 * `InvalidStateError`, which routes to `passkey-registration-error-invalid-state`.
 */
export const notAllowedExistingPasskeyMessage = (): ReactNode =>
  renderPasskeyErrorMessage({
    ftlId: 'passkey-registration-error-not-allowed-existing-v2',
    fallbackText:
      'Passkey setup couldn’t be completed. The passkey may already be registered. Try another device or method.',
    linkFtlId: 'passkey-registration-error-not-allowed-existing-link',
    gleanId: 'account_pref_passkey_create_help_already_registered',
  });
