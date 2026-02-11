/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../../../components/CardHeader';
import { usePageViewEvent } from '../../../lib/metrics';
import { HeartsVerifiedImage } from '../../../components/images';
import { REACT_ENTRYPOINT } from '../../../constants';
import Banner from '../../../components/Banner';

type PairSuccessProps = { error?: string };
export const viewName = 'pair-success';
const PairSuccess = ({ error }: PairSuccessProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  // TODO: We'll need to figure out how to localize the error (be it passing in a localized
  // error, or passing in an error id to compose the ftl id)
  return (
    <>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      <CardHeader
        headingTextFtlId="pair-success-header-2"
        headingText="Device connected"
      />
      <HeartsVerifiedImage className="w-3/5 mx-auto" />
      <FtlMsg id="pair-success-message-2">
        <p className="text-sm">Pairing was successful.</p>
      </FtlMsg>
    </>
  );
};

export default PairSuccess;
