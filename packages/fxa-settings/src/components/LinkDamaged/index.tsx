/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { LinkType } from '../../lib/types';
import CardHeader from '../CardHeader';
import AppLayout from '../AppLayout';

type LinkDamagedProps = {
  linkType: LinkType;
};

const getHeaderValues = (linkType: LinkType) => {
  let headerValues = {
    text: '',
    headerId: '',
  };
  switch (linkType) {
    case 'reset-password':
      headerValues.text = 'Reset password link damaged';
      headerValues.headerId = 'reset-pwd-link-damaged-header';
      break;
    case 'signin':
      headerValues.text = 'Confirmation link damaged';
      headerValues.headerId = 'signin-link-damaged-header';
      break;
    default:
      throw new Error('Invalid link type passed into LinkDamaged component');
  }
  return headerValues;
};

const LinkDamaged = ({ linkType }: LinkDamagedProps) => {
  // TODO : Metric event(s) for damaged link
  const headerValue = getHeaderValues(linkType);
  return (
    <AppLayout>
      <CardHeader
        headingText={headerValue.text}
        headingTextFtlId={headerValue.headerId}
      />

      <FtlMsg id="reset-pwd-link-damaged-message">
        <p className="mt-4 text-sm">
          The link you clicked was missing characters, and may have been broken
          by your email client. Copy the address carefully, and try again.
        </p>
      </FtlMsg>
    </AppLayout>
  );
};

export default LinkDamaged;
