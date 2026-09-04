/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../components/AppLayout';
import { Banner } from '../../components/Banner';
import { useFtlMsgResolver } from '../../models';

export type PasswordlessSyncOptInProps = {
  /** Stores the passkey so later Sync sign-ins can skip the password. */
  onEnable: () => void;
  /** Declines the offer and continues the sign-in flow. */
  onNotNow: () => void;
  isEnabling?: boolean;
  /** Shown when storing the passkey failed; already localized. */
  localizedErrorBannerMessage?: string;
};

/**
 * Offers to store the passkey the user just signed in to Sync with, so that
 * later Sync sign-ins skip the password step.
 *
 * Desktop only: mobile clients close the web view at browser handoff, so no
 * mobile breakpoints are needed here.
 */
const PasswordlessSyncOptIn = ({
  onEnable,
  onNotNow,
  isEnabling = false,
  localizedErrorBannerMessage,
}: PasswordlessSyncOptInProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <AppLayout
      title={ftlMsgResolver.getMsg(
        'passwordless-sync-opt-in-page-title',
        'Skip the password next time?'
      )}
    >
      {localizedErrorBannerMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorBannerMessage }}
        />
      )}

      <Banner
        type="success"
        content={{
          localizedHeading: ftlMsgResolver.getMsg(
            'passwordless-sync-opt-in-success-banner',
            'Signed into Sync'
          ),
        }}
      />

      <FtlMsg id="passwordless-sync-opt-in-heading">
        <h1 className="card-header mb-2">Skip the password next time?</h1>
      </FtlMsg>

      <FtlMsg id="passwordless-sync-opt-in-description">
        <p className="text-sm mb-6">Use this passkey to sign in faster.</p>
      </FtlMsg>

      <button
        type="button"
        className="cta-primary cta-xl w-full"
        onClick={onEnable}
        disabled={isEnabling}
      >
        {isEnabling ? (
          <FtlMsg id="passwordless-sync-opt-in-enabling">Enabling…</FtlMsg>
        ) : (
          <FtlMsg id="passwordless-sync-opt-in-enable-button">
            Enable passkey
          </FtlMsg>
        )}
      </button>

      <div className="mt-6 text-sm text-center">
        <FtlMsg id="passwordless-sync-opt-in-not-now-button">
          <button
            type="button"
            className="link-blue"
            onClick={onNotNow}
            disabled={isEnabling}
          >
            Not now
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default PasswordlessSyncOptIn;
