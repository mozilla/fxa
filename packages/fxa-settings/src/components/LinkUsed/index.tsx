/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../CardHeader';

type LinkUsedProps = {
  isForPrimaryEmail: boolean;
};

const getTemplateValues = (isPrimaryEmail: boolean) => {
  if (isPrimaryEmail) {
    return {
      headerText: 'Primary email already confirmed',
      headerId: 'primary-email-confirmation-link-reused',
    };
  }
  return {
    headerText: 'Sign-in already confirmed',
    headerId: 'signin-confirmation-link-reused',
  };
};

const LinkUsed = ({ isForPrimaryEmail }: LinkUsedProps) => {
  // TODO : Metric event(s) for expired link

  const templateValues = getTemplateValues(isForPrimaryEmail);

  return (
    <>
      <CardHeader
        headingText={templateValues.headerText}
        headingTextFtlId={templateValues.headerId}
      />

      <FtlMsg id="confirmation-link-reused-message">
        <p className="mt-4 text-sm">
          That confirmation link was already used, and can only be used once.
        </p>
      </FtlMsg>
    </>
  );
};

export default LinkUsed;
