/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { usePageViewEvent } from '../../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RouteComponentProps } from '@reach/router';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';

export const viewName = 'signin-reported';

const SigninReported = (props: RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      <CardHeader
        headingText="Thank you for your vigilance"
        headingTextFtlId="signin-reported-header"
      />
      <FtlMsg id="signin-reported-message">
        <p className="text-sm">
          Our team has been notified. Reports like this help us fend off
          intruders.
        </p>
      </FtlMsg>
    </AppLayout>
  );
};

export default SigninReported;
