/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import LoadingSpinner, {
  SpinnerType,
} from 'fxa-react/components/LoadingSpinner';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../components/AppLayout';
import { Banner } from '../../components/Banner';
import type { BannerProps } from '../../components/Banner/interfaces';
import { SyncCloudsImage } from '../../components/images';
import { useFtlMsgResolver } from '../../models';

export type InlinePasswordlessSyncSetupProps = {
  onEnable: () => void;
  onNotNow: () => void;
  isEnabling?: boolean;
  /** Replaces the sign-in confirmation while a retryable failure stands. */
  error?: Pick<BannerProps, 'type' | 'content' | 'link'>;
};

/** Desktop only: mobile clients close the web view before this page. */
const InlinePasswordlessSyncSetup = ({
  onEnable,
  onNotNow,
  isEnabling = false,
  error,
}: InlinePasswordlessSyncSetupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <AppLayout
      title={ftlMsgResolver.getMsg(
        'inline-passwordless-sync-setup-page-title',
        'Skip the password next time?'
      )}
    >
      {/* Keyed so swapping to the error mounts a fresh node: the two differ
          in ARIA role, which a reconciled element would change in place
          without re-announcing. */}
      {error ? (
        <Banner key="error" {...error} />
      ) : (
        <Banner
          key="success"
          type="success"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'inline-passwordless-sync-setup-success-banner',
              'Signed in to Firefox'
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
            {/* LoadingSpinner always sets aria-label; the text label covers it. */}
            <span aria-hidden>
              <LoadingSpinner
                spinnerType={SpinnerType.White}
                imageClassName="w-4 h-4 animate-spin"
              />
            </span>
            <FtlMsg id="inline-passwordless-sync-setup-enabling">
              Enabling…
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
          <button
            type="button"
            className="link-blue disabled:no-underline disabled:text-grey-500 dark:disabled:text-grey-300 disabled:cursor-wait"
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

export default InlinePasswordlessSyncSetup;
