/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../CardHeader';
import AppLayout from '../AppLayout';
import { ResendStatus } from '../../lib/types';
import Banner, { ResendEmailSuccessBanner, BannerType } from '../Banner';

export type LinkExpiredProps = {
  headingText: string;
  headingTextFtlId: string;
  messageText: string;
  messageFtlId: string;
  showResendLink?: boolean;
  resendLinkHandler?: () => Promise<void>;
  resendStatus?: ResendStatus;
  errorMessage?: string | ReactElement;
};

export const LinkExpired = ({
  headingText,
  headingTextFtlId,
  messageText,
  messageFtlId,
  showResendLink = true,
  resendLinkHandler,
  resendStatus = ResendStatus.none,
  errorMessage,
}: LinkExpiredProps) => {
  return (
    <AppLayout>
      <CardHeader {...{ headingText, headingTextFtlId }} />

      {resendStatus === ResendStatus.sent && <ResendEmailSuccessBanner />}
      {resendStatus === ResendStatus.error && errorMessage && (
        <Banner type={BannerType.error}>{errorMessage}</Banner>
      )}

      <FtlMsg id={messageFtlId}>
        <p className="text-sm my-4">{messageText}</p>
      </FtlMsg>
      {showResendLink && resendLinkHandler && (
        <FtlMsg id="reset-pwd-resend-link">
          <button onClick={resendLinkHandler} className="link-blue text-sm">
            Receive new link
          </button>
        </FtlMsg>
      )}
    </AppLayout>
  );
};
