/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import LoadingSpinner, {
  SpinnerType,
} from 'fxa-react/components/LoadingSpinner';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../components/AppLayout';
import { Banner } from '../../components/Banner';
import { SyncCloudsImage } from '../../components/images';
import { useFtlMsgResolver } from '../../models';

export type InlinePasswordlessSyncSetupProps = {
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
const InlinePasswordlessSyncSetup = ({
  onEnable,
  onNotNow,
  isEnabling = false,
  localizedErrorBannerMessage,
}: InlinePasswordlessSyncSetupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <AppLayout
      title={ftlMsgResolver.getMsg(
        'inline-passwordless-sync-setup-page-title',
        'Skip the password next time?'
      )}
    >
      {localizedErrorBannerMessage ? (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorBannerMessage }}
        />
      ) : (
        <Banner
          type="success"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'inline-passwordless-sync-setup-success-banner',
              'Signed in to Sync'
            ),
          }}
        />
      )}

      <SyncCloudsImage className="mx-auto mt-4 max-h-44" />

      <FtlMsg id="inline-passwordless-sync-setup-heading">
        <h1 className="card-header mb-2">Skip the password next time?</h1>
      </FtlMsg>

      <FtlMsg id="inline-passwordless-sync-setup-description">
        <p className="text-sm mb-6">Use this passkey to sign in faster.</p>
      </FtlMsg>

      <button
        type="button"
        className="cta-primary cta-xl w-full flex items-center justify-center gap-2"
        onClick={onEnable}
        disabled={isEnabling}
      >
        {isEnabling ? (
          <>
            {/* The label already announces the state, and LoadingSpinner has no
                way to drop its own aria-label. */}
            <span aria-hidden>
              <LoadingSpinner
                spinnerType={SpinnerType.White}
                imageClassName="w-4 h-4 animate-spin"
              />
            </span>
            <FtlMsg id="inline-passwordless-sync-setup-enabling">
              <span>Enabling…</span>
            </FtlMsg>
          </>
        ) : (
          <FtlMsg id="inline-passwordless-sync-setup-enable-button">
            Enable passkey
          </FtlMsg>
        )}
      </button>

      <div className="mt-6 text-sm text-center">
        <FtlMsg id="inline-passwordless-sync-setup-not-now-button">
          <button type="button" className="link-blue" onClick={onNotNow}>
            Not now
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default InlinePasswordlessSyncSetup;
