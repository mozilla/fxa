/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import CardHeader from '.';
import {
  MOCK_DEFAULT_HEADING_FTL_ID,
  MOCK_CUSTOM_HEADING_FTL_ID,
  MOCK_HEADING,
  MOCK_SERVICE_NAME,
} from './mocks';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

describe('CardHeader', () => {
  // TODO: Enable testing l10n with id passed as prop in FXA-6462

  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected when no serviceName is provided', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingWithDefaultServiceFtlId={MOCK_DEFAULT_HEADING_FTL_ID}
        headingWithCustomServiceFtlId={MOCK_CUSTOM_HEADING_FTL_ID}
        headingText={MOCK_HEADING}
      />
    );
    // testAllL10n(screen, bundle);

    expect(
      screen.getByRole('heading', {
        name: `${MOCK_HEADING} to continue to account settings`,
      })
    ).toBeInTheDocument();
  });

  it('renders as expected when a serviceName is provided', () => {
    renderWithLocalizationProvider(
      <CardHeader
        headingWithDefaultServiceFtlId={MOCK_DEFAULT_HEADING_FTL_ID}
        headingWithCustomServiceFtlId={MOCK_CUSTOM_HEADING_FTL_ID}
        headingText={MOCK_HEADING}
        serviceName={MOCK_SERVICE_NAME}
      />
    );

    expect(
      screen.getByRole('heading', {
        name: `${MOCK_HEADING} to continue to ${MOCK_SERVICE_NAME}`,
      })
    ).toBeInTheDocument();
  });
});
