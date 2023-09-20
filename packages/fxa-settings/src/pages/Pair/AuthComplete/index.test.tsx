/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AuthComplete, { viewName } from '.';
import { MOCK_METADATA_UNKNOWN_LOCATION } from '../../../components/DeviceInfoBlock/mocks';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('AuthComplete page', () => {
  // TODO: enable l10n tests when FXA-6461 is resolved (handle embedded tags)
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders the default page as expected', () => {
    renderWithLocalizationProvider(
      <AuthComplete suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
    );
    // testAllL10n(screen, bundle);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Device connected'
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'You are now syncing with: Firefox on macOS'
    );
    // TODO expect image - animated vs not-animated
    screen.getByText(
      'Now you can access your open tabs, passwords, and bookmarks on all your devices.'
    );
    screen.getByRole('link', { name: 'Manage devices' });
  });

  it('renders the correct button when Firefox view is supported', () => {
    renderWithLocalizationProvider(
      <AuthComplete
        suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        supportsFirefoxView
      />
    );
    expect(
      screen.queryByRole('link', { name: 'Manage devices' })
    ).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'See tabs from synced devices' });
  });
  // Add tests for button/link handling

  it('emits expected metrics events on render', () => {
    renderWithLocalizationProvider(
      <AuthComplete suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
    );

    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
