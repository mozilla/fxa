/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ThirdPartyAuthCallback from '.';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { LocationProvider } from '@reach/router';
import { ThirdPartyAuthProps } from '../../../components/ThirdPartyAuth';

function renderWith(props?: ThirdPartyAuthProps) {
  return renderWithLocalizationProvider(
    <AppContext.Provider value={mockAppContext()}>
      <LocationProvider>
        <ThirdPartyAuthCallback {...props} />;
      </LocationProvider>
    </AppContext.Provider>
  );
}

describe('ThirdPartyAuth component', () => {
  it('renders as expected', () => {
    renderWith();
    screen.getByText(
      'Please wait, you are being redirected to the authorized application.'
    );
  });
});
