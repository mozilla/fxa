/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AuthComplete, { PAIR_DEVICE_INFO_PREFIX, viewName } from '.';
import { MOCK_METADATA_UNKNOWN_LOCATION } from '../../../components/DeviceInfoBlock/mocks';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Integration } from '../../../models/integrations/integration';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

const MOCK_CHANNEL_ID = 'test-channel-id';
const MOCK_DEVICE_INFO_KEY = `${PAIR_DEVICE_INFO_PREFIX}${MOCK_CHANNEL_ID}`;

jest.mock('../../../models/integrations/pairing-authority-integration', () => ({
  PairingAuthorityIntegration: class {
    channelId = 'test-channel-id';
    getSupplicantMetadata = jest.fn().mockResolvedValue(null);
    complete = jest.fn();
    destroy = jest.fn();
  },
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

  describe('with PairingAuthorityIntegration', () => {
    let mockIntegration: {
      getSupplicantMetadata: jest.Mock;
      complete: jest.Mock;
      destroy: jest.Mock;
      data: { entrypoint?: string };
    };

    beforeEach(() => {
      const { PairingAuthorityIntegration: PAI } = jest.requireMock(
        '../../../models/integrations/pairing-authority-integration'
      );
      mockIntegration = new PAI();
      mockIntegration.data = { entrypoint: undefined };
      sessionStorage.clear();
    });

    it('calls complete() on mount and destroy() on unmount', () => {
      const { unmount } = renderWithLocalizationProvider(
        <AuthComplete integration={mockIntegration as unknown as Integration} />
      );
      expect(mockIntegration.complete).toHaveBeenCalled();
      unmount();
      expect(mockIntegration.destroy).toHaveBeenCalled();
    });

    it('clears cached device info from sessionStorage on unmount', () => {
      sessionStorage.setItem(
        MOCK_DEVICE_INFO_KEY,
        JSON.stringify({
          deviceFamily: 'Firefox',
          deviceOS: 'Windows',
          ipAddress: '1.2.3.4',
        })
      );

      const { unmount } = renderWithLocalizationProvider(
        <AuthComplete integration={mockIntegration as unknown as Integration} />
      );
      expect(sessionStorage.getItem(MOCK_DEVICE_INFO_KEY)).not.toBeNull();
      unmount();
      expect(sessionStorage.getItem(MOCK_DEVICE_INFO_KEY)).toBeNull();
    });

    it('restores device info from sessionStorage after refresh', () => {
      const cachedInfo = {
        deviceFamily: 'Firefox',
        deviceOS: 'Windows',
        ipAddress: '1.2.3.4',
      };
      sessionStorage.setItem(MOCK_DEVICE_INFO_KEY, JSON.stringify(cachedInfo));

      renderWithLocalizationProvider(
        <AuthComplete integration={mockIntegration as unknown as Integration} />
      );

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'You are now syncing with: Firefox on Windows'
      );
      expect(mockIntegration.getSupplicantMetadata).not.toHaveBeenCalled();
    });

    it('persists fetched device info to sessionStorage', async () => {
      const fetchedInfo = {
        deviceFamily: 'Firefox',
        deviceOS: 'Android',
        ipAddress: '1.2.3.4',
      };
      mockIntegration.getSupplicantMetadata.mockResolvedValue(fetchedInfo);

      renderWithLocalizationProvider(
        <AuthComplete integration={mockIntegration as unknown as Integration} />
      );

      await waitFor(() =>
        expect(sessionStorage.getItem(MOCK_DEVICE_INFO_KEY)).toBe(
          JSON.stringify(fetchedInfo)
        )
      );
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'You are now syncing with: Firefox on Android'
      );
    });
  });

  describe('Send Tab variant', () => {
    it('renders the send-tab layout when entrypoint is a Send Tab entrypoint', () => {
      const mockIntegration = {
        getSupplicantMetadata: jest.fn().mockResolvedValue(null),
        complete: jest.fn(),
        destroy: jest.fn(),
        data: { entrypoint: 'send-tab-toolbar-icon' },
      };
      renderWithLocalizationProvider(
        <AuthComplete
          integration={mockIntegration as unknown as Integration}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />
      );
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'You’re ready to send some tabs'
      );
      expect(
        screen.getByText(/Firefox for macOS is connected\./)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'You’re free to instantly send open tabs, passwords, and bookmarks between devices.'
        )
      ).toBeInTheDocument();
      // No CTA buttons or links in the Send Tab variant
      expect(
        screen.queryByRole('button', { name: 'See tabs from synced devices' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Manage devices' })
      ).not.toBeInTheDocument();
    });

    it('renders the default layout for non-Send Tab entrypoints', () => {
      const mockIntegration = {
        getSupplicantMetadata: jest.fn().mockResolvedValue(null),
        complete: jest.fn(),
        destroy: jest.fn(),
        data: { entrypoint: 'preferences' },
      };
      renderWithLocalizationProvider(
        <AuthComplete
          integration={mockIntegration as unknown as Integration}
          suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
        />
      );
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Device connected'
      );
    });
  });
});
