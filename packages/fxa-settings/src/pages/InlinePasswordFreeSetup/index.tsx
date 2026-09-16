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

export type InlinePasswordFreeSetupProps = {
  onEnable: () => void;
  onNotNow: () => void;
  isEnabling?: boolean;
};

/** Desktop only: mobile clients close the web view before this page. */
const InlinePasswordFreeSetup = ({
  onEnable,
  onNotNow,
  isEnabling = false,
}: InlinePasswordFreeSetupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <AppLayout
      title={ftlMsgResolver.getMsg(
        'inline-password-free-setup-page-title',
        'Skip the password next time?'
      )}
    >
      <Banner
        type="success"
        content={{
          localizedHeading: ftlMsgResolver.getMsg(
            'inline-password-free-setup-success-banner',
            'Signed in to Firefox'
          ),
        }}
      />

      <SyncCloudsImage className="mx-auto mt-4 max-h-44" />

      <FtlMsg id="inline-password-free-setup-heading">
        <h1 className="card-header mb-2">Skip the password next time?</h1>
      </FtlMsg>

      <FtlMsg id="inline-password-free-setup-description">
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
            <FtlMsg id="inline-password-free-setup-enabling">Enabling…</FtlMsg>
          </>
        ) : (
          <FtlMsg id="inline-password-free-setup-enable-button">
            Enable passkey
          </FtlMsg>
        )}
      </button>

      <div className="mt-6 text-sm text-center">
        <FtlMsg id="inline-password-free-setup-not-now-button">
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

export default InlinePasswordFreeSetup;
