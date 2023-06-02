/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../CardHeader';
import AppLayout from '../AppLayout';
import { ResendStatus } from '../../lib/types';
import { ResendLinkErrorBanner, ResendEmailSuccessBanner } from '../Banner';

export type LinkExpiredProps = {
  headingText: string;
  headingTextFtlId: string;
  messageText: string;
  messageFtlId: string;
  resendLinkHandler: () => Promise<void>;
  resendStatus: ResendStatus;
};

export const LinkExpired = ({
  headingText,
  headingTextFtlId,
  messageText,
  messageFtlId,
  resendLinkHandler,
  resendStatus,
}: LinkExpiredProps) => {
  return (
    <AppLayout>
      <CardHeader {...{ headingText, headingTextFtlId }} />

      {resendStatus === ResendStatus['sent'] && <ResendEmailSuccessBanner />}
      {resendStatus === ResendStatus['error'] && <ResendLinkErrorBanner />}

      <FtlMsg id={messageFtlId}>
        <p className="text-sm my-4">{messageText}</p>
      </FtlMsg>
      <FtlMsg id="reset-pwd-resend-link">
        <button onClick={resendLinkHandler} className="link-blue text-sm">
          Receive new link
        </button>
      </FtlMsg>
    </AppLayout>
  );
};
