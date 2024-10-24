/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import { AuthError } from '../../lib/oauth';
import { useFtlMsgResolver } from '../../models';
import AppLayout from '../AppLayout';
import Banner from '../Banner';
import CardHeader from '../CardHeader';

const OAuthDataError = ({ error }: { error: AuthError }) => {
  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <AppLayout>
      <CardHeader
        headingText="Bad Request"
        headingTextFtlId="error-bad-request"
      />
      {/* TODO Localize this, FXA-9502, and account for potential errno
        overlaps with AuthErrors (see ticket). */}
      <Banner
        type="error"
        content={{
          localizedHeading: getLocalizedErrorMessage(ftlMsgResolver, error),
        }}
      />
    </AppLayout>
  );
};

export default OAuthDataError;
