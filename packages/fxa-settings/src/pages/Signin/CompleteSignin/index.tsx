/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import Banner from '../../../components/Banner';

export type CompleteSigninProps = { errorMessage?: string };

const CompleteSignin = ({
  errorMessage,
}: CompleteSigninProps & RouteComponentProps) => {
  if (errorMessage) {
    return (
      <AppLayout>
        <CardHeader
          headingText="Confirmation error"
          headingTextFtlId="complete-signin-error-header"
        />
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      </AppLayout>
    );
  } else {
    return (
      <AppLayout>
        <FtlMsg id="validating-signin">
          <p className="text-base">Validating sign-in…</p>
        </FtlMsg>
        <LoadingSpinner className="flex justify-center mt-6" />
      </AppLayout>
    );
  }
};

export default CompleteSignin;
