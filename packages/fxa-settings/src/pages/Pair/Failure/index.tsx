/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../../../components/CardHeader';
import { usePageViewEvent } from '../../../lib/metrics';
import { HeartsBrokenImage } from '../../../components/images';
import { REACT_ENTRYPOINT } from '../../../constants';
import AppLayout from '../../../components/AppLayout';
import Banner from '../../../components/Banner';

type PairFailureProps = { error?: string };
export const viewName = 'pair-failure';

const PairFailure = ({ error }: PairFailureProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  return (
    <AppLayout>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      <CardHeader
        headingTextFtlId="pair-failure-header-v2"
        headingText="Device pairing failed"
      />
      <HeartsBrokenImage className="w-3/5 mx-auto" />
      <FtlMsg id="pair-failure-message-v2">
        <p className="text-sm">
          The setup couldn’t be completed. Please sign in with your email.
        </p>
      </FtlMsg>
    </AppLayout>
  );
};

export default PairFailure;
