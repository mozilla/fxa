/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { usePageViewEvent } from '../../../lib/metrics';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import Banner from '../../../components/Banner';

// pair/supp is the gateway to the supplicant pairing flow
// see pairing-architecture.md for functionality to be implemented in FXA-6502

export type SuppProps = {
  // TODO: In FXA-6502 - Listen to broken for error/success messages
  // included in props temporarily for tests/storybook
  error?: string;
};

export const viewName = 'pair.supp';

const Supp = ({ error }: SuppProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      {error ? (
        <Banner type="error" content={{ localizedHeading: error }} />
      ) : (
        <LoadingSpinner fullScreen />
      )}
    </AppLayout>
  );
};

export default Supp;
