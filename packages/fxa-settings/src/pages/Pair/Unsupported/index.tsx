/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../../../components/CardHeader';
import { usePageViewEvent } from '../../../lib/metrics';
import { HeartsBrokenImage } from '../../../components/images';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import Banner from '../../../components/Banner';
type PairUnsupportedProps = { error?: string };
export const viewName = 'pair-unsupported';

const PairUnsupported = ({
  error,
}: PairUnsupportedProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  useEffect(() => {
    GleanMetrics.cadMobilePairUseApp.view();
  }, []);

  return (
    <>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      <CardHeader
        headingTextFtlId="pair-unsupported-header"
        headingText="Pair using an app"
      />
      <HeartsBrokenImage className="w-3/5 mx-auto" />
      <FtlMsg id="pair-unsupported-message">
        <p className="text-sm">
          Did you use the system camera? You must pair from within a Firefox
          app.
        </p>
      </FtlMsg>
    </>
  );
};

export default PairUnsupported;
