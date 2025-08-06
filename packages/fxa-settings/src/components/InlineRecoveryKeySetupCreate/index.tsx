/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RecoveryKeyImage } from '../images';
import { FtlMsg } from 'fxa-react/lib/utils';
import { CreateRecoveryKeyHandler } from '../../pages/InlineRecoveryKeySetup/interfaces';
import Banner from '../Banner';
import { RelierCmsInfo, useFtlMsgResolver } from '../../models';
import { HeadingPrimary } from '../HeadingPrimary';
import CmsButtonWithFallback from '../CmsButtonWithFallback';

export interface InlineRecoveryKeySetupCreateProps {
  createRecoveryKeyHandler: () => Promise<CreateRecoveryKeyHandler>;
  doLaterHandler: () => void;
  cmsInfo?: RelierCmsInfo;
}

export const InlineRecoveryKeySetupCreate = ({
  createRecoveryKeyHandler,
  doLaterHandler,
  cmsInfo
}: InlineRecoveryKeySetupCreateProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState('');

  const ftlMsgResolver = useFtlMsgResolver();

  const createRecoveryKey = async () => {
    setIsLoading(true);
    setLocalizedErrorBannerMessage('');

    const { localizedErrorMessage } = await createRecoveryKeyHandler();
    if (localizedErrorMessage) {
      setLocalizedErrorBannerMessage(localizedErrorMessage);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Banner
        type="success"
        content={{
          localizedHeading: ftlMsgResolver.getMsg(
            'inline-recovery-key-setup-signed-in-firefox-2',
            'You’re signed in to Firefox.'
          ),
        }}
      />
      {localizedErrorBannerMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorBannerMessage }}
        />
      )}
      <FtlMsg id="inline-recovery-key-setup-create-header">
        <HeadingPrimary>Secure your account</HeadingPrimary>
      </FtlMsg>

      <RecoveryKeyImage />

      <h2 className="font-bold text-xl mb-5">
        <FtlMsg id="inline-recovery-key-setup-create-subheader">
          Got a minute to protect your data?
        </FtlMsg>
      </h2>

      <p className="text-sm mb-5">
        <FtlMsg id="inline-recovery-key-setup-info">
          Create an account recovery key so you can restore your sync browsing
          data if you ever forget your password.
        </FtlMsg>
      </p>

      <div className="flex mb-7">
        <CmsButtonWithFallback
          className="flex justify-center items-center"
          type="submit"
          onClick={createRecoveryKey}
          disabled={isLoading}
          data-glean-id="inline_recovery_key_cta_submit"
          buttonColor={cmsInfo?.shared?.buttonColor}
        >
          <FtlMsg id="inline-recovery-key-setup-start-button">
            Create account recovery key
          </FtlMsg>
        </CmsButtonWithFallback>
      </div>

      <button
        className="flex justify-center items-center link-blue text-sm mx-auto"
        onClick={doLaterHandler}
        data-glean-id="inline_recovery_key_setup_create_do_it_later"
      >
        <FtlMsg id="inline-recovery-key-setup-later-button">Do it later</FtlMsg>
      </button>
    </>
  );
};

export default InlineRecoveryKeySetupCreate;
