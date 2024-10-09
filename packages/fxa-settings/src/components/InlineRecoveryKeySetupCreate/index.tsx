/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { CheckmarkCircleOutlineIcon, RecoveryKeyImage } from '../images';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner, { BannerType } from '../Banner';
import { CreateRecoveryKeyHandler } from '../../pages/InlineRecoveryKeySetup/interfaces';

export const InlineRecoveryKeySetupCreate = ({
  createRecoveryKeyHandler,
  doLaterHandler,
}: {
  createRecoveryKeyHandler: () => Promise<CreateRecoveryKeyHandler>;
  doLaterHandler: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [bannerError, setBannerError] = useState('');

  const createRecoveryKey = async () => {
    setIsLoading(true);
    setBannerError('');

    const { localizedErrorMessage } = await createRecoveryKeyHandler();
    if (localizedErrorMessage) {
      setBannerError(localizedErrorMessage);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Banner type={BannerType.success} additionalClassNames="mt-0">
        <p className="flex justify-center text-base">
          <CheckmarkCircleOutlineIcon className="me-3" />
          <span>
            <FtlMsg id="inline-recovery-key-setup-signed-in-firefox">
              You’re signed in to Firefox
            </FtlMsg>
          </span>
        </p>
      </Banner>
      {bannerError && (
        <Banner type={BannerType.error}>
          <p className="text-center">{bannerError}</p>
        </Banner>
      )}
      <h1 className="text-grey-400 mb-3 mt-5">
        <FtlMsg id="inline-recovery-key-setup-create-header">
          Secure your account
        </FtlMsg>
      </h1>

      <RecoveryKeyImage className="my-6 mx-auto" />

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
        <button
          className="flex justify-center items-center cta-primary cta-xl"
          type="submit"
          onClick={createRecoveryKey}
          disabled={isLoading}
          data-glean-id="inline_recovery_key_cta_submit"
        >
          <FtlMsg id="inline-recovery-key-setup-start-button">
            Create account recovery key
          </FtlMsg>
        </button>
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
