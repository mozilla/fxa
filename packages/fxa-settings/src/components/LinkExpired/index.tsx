/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { LinkType } from '../../lib/types';
import CardHeader from '../CardHeader';

type LinkExpiredProps = {
  linkType: LinkType;
};

const getResendLinkHandler = (linkType: LinkType) => {
  if (linkType === 'reset-password') {
    return function () {
      //   TODO: add resend link action
    };
  }
  return function () {
    //   TODO: add resend link action
  };
};

const getTemplateValues = (linkType: LinkType) => {
  let templateValues = {
    headerText: '',
    headerId: '',
    messageText: '',
    messageId: '',
  };
  switch (linkType) {
    case 'reset-password':
      templateValues.headerText = 'Reset password link expired';
      templateValues.headerId = 'reset-pwd-link-expired-header';
      templateValues.messageText =
        'The link you clicked to reset your password is expired.';
      templateValues.messageId = 'reset-pwd-link-expired-message';

      break;
    case 'signin':
      templateValues.headerText = 'Confirmation link expired';
      templateValues.headerId = 'signin-link-expired-header';
      templateValues.messageText =
        'The link you clicked to confirm your email is expired.';
      templateValues.messageId = 'signin-link-expired-message';

      break;
    default:
      throw new Error('Invalid link type passed into LinkExpired component');
  }
  return templateValues;
};

const LinkExpired = ({ linkType }: LinkExpiredProps) => {
  // TODO : Metric event(s) for expired link

  const resendLinkHandler = getResendLinkHandler(linkType);
  const templateValues = getTemplateValues(linkType);

  return (
    <>
      {/* TODO: Add alertBar for success/failure status of resendLinkHandler */}
      <CardHeader
        headingText={templateValues.headerText}
        headingTextFtlId={templateValues.headerId}
      />

      <FtlMsg id={templateValues.messageId}>
        <p className="mt-4 text-sm">{templateValues.messageText}</p>
      </FtlMsg>
      <FtlMsg id="resend-link">
        <button onClick={resendLinkHandler} className="link-blue mt-4">
          Receive new link
        </button>
      </FtlMsg>
    </>
  );
};

export default LinkExpired;
