/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LocationProvider,
  createHistory,
  createMemorySource,
} from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import FirefoxPromoBanner from './index';
import { Constants } from '../../lib/constants';
import { isProbablyFirefox, useAccount } from '../../models';
import { isMobileDevice, isMobileOrTabletDevice } from '../../lib/utilities';
import GleanMetrics from '../../lib/glean';

jest.mock('../../models', () => ({
  __esModule: true,
  isProbablyFirefox: jest.fn(),
  useAccount: jest.fn(),
}));

jest.mock('../../lib/utilities', () => ({
  __esModule: true,
  isMobileDevice: jest.fn(),
  isMobileOrTabletDevice: jest.fn(),
}));

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    firefoxPromo: {
      connectMobileView: jest.fn(),
      connectMobileSubmit: jest.fn(),
      connectMobileDismiss: jest.fn(),
      switchToFirefoxView: jest.fn(),
      switchToFirefoxSubmit: jest.fn(),
      switchToFirefoxDismiss: jest.fn(),
    },
  },
}));

const mockIsFirefox = isProbablyFirefox as jest.Mock;
// Banner variant is driven by the current-device check (phone or tablet);
// the attached-device count uses the per-client check.
const mockIsMobileOrTablet = isMobileOrTabletDevice as jest.Mock;
const mockIsMobileDevice = isMobileDevice as jest.Mock;
const mockUseAccount = useAccount as jest.Mock;

function renderBanner({ isSignedIntoFirefox = false } = {}) {
  const history = createHistory(createMemorySource('/settings'));
  return renderWithLocalizationProvider(
    <LocationProvider {...{ history }}>
      <FirefoxPromoBanner {...{ isSignedIntoFirefox }} />
    </LocationProvider>
  );
}

describe('FirefoxPromoBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockUseAccount.mockReturnValue({ attachedClients: [] });
    // Per-client count check; the no-arg variant check is set per test.
    mockIsMobileDevice.mockImplementation(
      (client) => client?.deviceType === 'mobile'
    );
  });

  it('renders the mobile-install variant on desktop Firefox signed into the browser and emits view', () => {
    mockIsFirefox.mockReturnValue(true);
    mockIsMobileOrTablet.mockReturnValue(false);
    renderBanner({ isSignedIntoFirefox: true });

    expect(GleanMetrics.firefoxPromo.connectMobileView).toHaveBeenCalledWith({
      event: { mobile_device_count: '0' },
    });
    expect(
      GleanMetrics.firefoxPromo.switchToFirefoxView
    ).not.toHaveBeenCalled();
    expect(
      screen.getByRole('link', { name: 'Connect a device' })
    ).toHaveAttribute('href', '/pair');
  });

  it('emits the view with the count of attached mobile devices', () => {
    mockIsFirefox.mockReturnValue(true);
    mockIsMobileOrTablet.mockReturnValue(false);
    mockUseAccount.mockReturnValue({
      attachedClients: [
        { deviceType: 'mobile' },
        { deviceType: 'desktop' },
        { deviceType: 'mobile' },
      ],
    });
    renderBanner({ isSignedIntoFirefox: true });

    expect(GleanMetrics.firefoxPromo.connectMobileView).toHaveBeenCalledWith({
      event: { mobile_device_count: '2' },
    });
  });

  it('emits the submit event with the device count when the CTA is clicked', async () => {
    const user = userEvent.setup();
    mockIsFirefox.mockReturnValue(true);
    mockIsMobileOrTablet.mockReturnValue(false);
    mockUseAccount.mockReturnValue({
      attachedClients: [{ deviceType: 'mobile' }],
    });
    renderBanner({ isSignedIntoFirefox: true });

    await user.click(screen.getByRole('link', { name: 'Connect a device' }));
    expect(GleanMetrics.firefoxPromo.connectMobileSubmit).toHaveBeenCalledWith({
      event: { mobile_device_count: '1' },
    });
  });

  it('renders the switch variant on desktop non-Firefox with the desktop download url', () => {
    mockIsFirefox.mockReturnValue(false);
    mockIsMobileOrTablet.mockReturnValue(false);
    renderBanner();

    expect(GleanMetrics.firefoxPromo.switchToFirefoxView).toHaveBeenCalledTimes(
      1
    );
    expect(
      screen.getByRole('link', { name: /Switch to Firefox/ })
    ).toHaveAttribute('href', Constants.FIREFOX_DESKTOP_DOWNLOAD_URL);
  });

  it('uses the mobile download url on a mobile or tablet non-Firefox device', () => {
    mockIsFirefox.mockReturnValue(false);
    mockIsMobileOrTablet.mockReturnValue(true);
    renderBanner();

    expect(
      screen.getByRole('link', { name: /Switch to Firefox/ })
    ).toHaveAttribute('href', Constants.FIREFOX_MOBILE_DOWNLOAD_URL);
  });

  it('renders nothing on Firefox mobile (the app is already installed)', () => {
    mockIsFirefox.mockReturnValue(true);
    mockIsMobileOrTablet.mockReturnValue(true);
    const { container } = renderBanner({ isSignedIntoFirefox: true });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing on desktop Firefox not signed into the browser', () => {
    mockIsFirefox.mockReturnValue(true);
    mockIsMobileOrTablet.mockReturnValue(false);
    const { container } = renderBanner({ isSignedIntoFirefox: false });
    expect(container).toBeEmptyDOMElement();
    expect(GleanMetrics.firefoxPromo.connectMobileView).not.toHaveBeenCalled();
  });

  it('persists dismissal when the close button is clicked', async () => {
    const user = userEvent.setup();
    mockIsFirefox.mockReturnValue(false);
    mockIsMobileOrTablet.mockReturnValue(false);
    renderBanner();

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }));
    expect(localStorage.getItem(Constants.DISABLE_PROMO_FIREFOX_BANNER)).toBe(
      'true'
    );
  });

  it('emits the switch dismiss event with the device count when dismissed', async () => {
    const user = userEvent.setup();
    mockIsFirefox.mockReturnValue(false);
    mockIsMobileOrTablet.mockReturnValue(false);
    mockUseAccount.mockReturnValue({
      attachedClients: [{ deviceType: 'mobile' }],
    });
    renderBanner();

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }));
    expect(
      GleanMetrics.firefoxPromo.switchToFirefoxDismiss
    ).toHaveBeenCalledWith({ event: { mobile_device_count: '1' } });
  });

  it('emits the connect-mobile dismiss event when dismissed on desktop Firefox', async () => {
    const user = userEvent.setup();
    mockIsFirefox.mockReturnValue(true);
    mockIsMobileOrTablet.mockReturnValue(false);
    renderBanner({ isSignedIntoFirefox: true });

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }));
    expect(GleanMetrics.firefoxPromo.connectMobileDismiss).toHaveBeenCalledWith(
      { event: { mobile_device_count: '0' } }
    );
    expect(
      GleanMetrics.firefoxPromo.switchToFirefoxDismiss
    ).not.toHaveBeenCalled();
  });
});
