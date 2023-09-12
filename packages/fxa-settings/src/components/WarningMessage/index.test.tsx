/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

import WarningMessage from '.';
import {
  MOCK_WARNING_MESSAGE_FTL_ID,
  MOCK_WARNING_MESSAGE,
  MOCK_WARNING_TYPE,
} from './mocks';

describe('WarningMessage', () => {
  // TODO: Enable l10n testing with id passed as prop
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    renderWithLocalizationProvider(
      <WarningMessage
        warningMessageFtlId={MOCK_WARNING_MESSAGE_FTL_ID}
        warningType={MOCK_WARNING_TYPE}
      >
        {MOCK_WARNING_MESSAGE}
      </WarningMessage>
    );
    // testAllL10n(screen, bundle);

    expect(screen.getByTestId('warning-message-container')).toHaveTextContent(
      'Beware: If you eat too many cookies, you might feel very sick.'
    );
  });
});
