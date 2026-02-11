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
import Banner from '../../../components/Banner';

type PairFailureProps = { error?: string };
export const viewName = 'pair-failure';

const PairFailure = ({ error }: PairFailureProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  // TODO: We'll need to figure out how to actually localize the error (be it passing in a localized
  // error, or passing in an error id to compose the ftl id)
  return (
    <>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      <CardHeader
        headingTextFtlId="pair-failure-header"
        headingText="Pairing not successful"
      />
      <HeartsBrokenImage className="w-3/5 mx-auto" />
      <FtlMsg id="pair-failure-message">
        <p className="text-sm">The setup process was terminated.</p>
      </FtlMsg>
    </>
  );
};

export default PairFailure;
