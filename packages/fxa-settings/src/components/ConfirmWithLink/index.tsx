/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { MailImage } from '../../components/images';
import CardHeader from '../CardHeader';
import { ResendStatus } from '../../lib/types';
import Banner, { BannerType } from '../Banner';
import { FIREFOX_NOREPLY_EMAIL } from '../../constants';

export type ConfirmWithLinkProps = {
  confirmWithLinkPageStrings: ConfirmWithLinkPageStrings;
  email: string;
  navigateBackHandler?: () => void;
  resendEmailHandler: () => void;
  resendStatus: ResendStatus;
};

export type ConfirmWithLinkPageStrings = {
  headingText: string;
  headingFtlId: string;
  instructionText: string;
  instructionFtlId: string;
};

const ConfirmWithLink = ({
  confirmWithLinkPageStrings,
  email,
  navigateBackHandler,
  resendEmailHandler,
  resendStatus,
}: ConfirmWithLinkProps) => {
  const displaySuccessBanner = (
    <Banner type={BannerType.success}>
      <FtlMsg
        id="link-expired-resent-link-success-message"
        vars={{ accountsEmail: FIREFOX_NOREPLY_EMAIL }}
      >
        {`Email resent. Add ${FIREFOX_NOREPLY_EMAIL} to your contacts to ensure a
        smooth delivery.`}
      </FtlMsg>
    </Banner>
  );

  const displayErrorBanner = (
    <Banner type={BannerType.error}>
      <FtlMsg id="link-expired-resent-link-error-message">
        Something went wrong. A new link could not be sent.
      </FtlMsg>
    </Banner>
  );
  return (
    <>
      <CardHeader
        headingText={confirmWithLinkPageStrings.headingText}
        headingTextFtlId={confirmWithLinkPageStrings.headingFtlId}
      />

      {resendStatus === ResendStatus['sent'] && displaySuccessBanner}
      {resendStatus === ResendStatus['error'] && displayErrorBanner}

      <div className="flex justify-center">
        <MailImage />
      </div>
      <FtlMsg id={confirmWithLinkPageStrings.instructionFtlId} vars={{ email }}>
        <p className="my-4 text-sm">
          {confirmWithLinkPageStrings.instructionText}
        </p>
      </FtlMsg>
      <div className="flex flex-col gap-3">
        <FtlMsg id="confirm-with-link-resend-link-button">
          <button
            className="mx-auto link-blue text-sm opacity-0 animate-delayed-fade-in"
            onClick={resendEmailHandler}
          >
            Not in inbox or spam folder? Resend
          </button>
        </FtlMsg>
        {navigateBackHandler && (
          <FtlMsg id="confirm-with-link-back-link">
            <button
              className="mx-auto link-blue text-sm opacity-0 animate-delayed-fade-in"
              onClick={navigateBackHandler}
            >
              Back
            </button>
          </FtlMsg>
        )}
      </div>
    </>
  );
};

export default ConfirmWithLink;
