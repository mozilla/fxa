/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { CircleCheckOutlineImage, RecoveryKeyImage } from '../images';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner, { BannerType } from '../Banner';

export const InlineRecoveryKeySetupCreate = ({
  createRecoveryKeyHandler,
  doLaterHandler,
}: {
  createRecoveryKeyHandler: () => Promise<void>;
  doLaterHandler: () => Promise<void>;
}) => {
  return (
    <>
      <Banner type={BannerType.success} additionalClassNames="mt-0">
        <p className="flex justify-center text-base">
          <CircleCheckOutlineImage className="me-3" />
          <span>
            <FtlMsg id="inline-recovery-key-setup-signed-in-firefox">
              You’re signed in to Firefox
            </FtlMsg>
          </span>
        </p>
      </Banner>
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
        >
          <FtlMsg id="inline-recovery-key-setup-start-button">
            Create account recovery key
          </FtlMsg>
        </button>
      </div>

      <button className="flex justify-center items-center link-blue text-sm mx-auto">
        <FtlMsg id="inline-recovery-key-setup-later-button">Do it later</FtlMsg>
      </button>
    </>
  );
};

export default InlineRecoveryKeySetupCreate;
