/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { createHistory, createMemorySource } from '@reach/router';
import { PromoQrMobile, PromoQrMobileIntegration } from '.';
import { IntegrationType } from '../../models/integrations';
import { renderWithRouter } from '../../models/mocks';
import GleanMetrics from '../../lib/glean';

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    promoQrMobile: {
      view: jest.fn(),
    },
  },
}));

// jsdom does not implement matchMedia
const mockMatchMedia = jest.fn();
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });
});

function createIntegration(type: IntegrationType): PromoQrMobileIntegration {
  return { type };
}

function renderAtRoute(
  pathname: string,
  integration: PromoQrMobileIntegration
) {
  const history = createHistory(createMemorySource(pathname));
  return renderWithRouter(<PromoQrMobile integration={integration} />, {
    history,
  });
}

describe('PromoQrMobile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchMedia.mockReturnValue({ matches: true });
  });

  describe('visibility based on integration type', () => {
    it('renders for web integrations', () => {
      renderAtRoute('/', createIntegration(IntegrationType.Web));
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('does not render for OAuth integrations', () => {
      renderAtRoute('/', createIntegration(IntegrationType.OAuthWeb));
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('does not render for Sync integrations', () => {
      renderAtRoute('/', createIntegration(IntegrationType.OAuthNative));
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  describe('visibility based on route', () => {
    const webIntegration = createIntegration(IntegrationType.Web);

    it.each([
      '/',
      '/signin',
      '/signin_totp_code',
      '/signin_recovery_choice',
      '/signin_recovery_code',
      '/signin_passwordless_code',
      '/signup',
      '/confirm_signup_code',
      '/inline_totp_setup',
      '/inline_recovery_setup',
      '/inline_recovery_key_setup',
    ])('renders on %s', (route) => {
      renderAtRoute(route, webIntegration);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it.each([
      '/reset_password',
      '/confirm_reset_password',
      '/complete_reset_password',
      '/settings',
      '/oauth',
      '/authorization',
      '/legal',
    ])('does not render on %s', (route) => {
      renderAtRoute(route, webIntegration);
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  describe('Glean view event', () => {
    const webIntegration = createIntegration(IntegrationType.Web);

    it('fires the view event once on desktop', () => {
      mockMatchMedia.mockReturnValue({ matches: true });
      renderAtRoute('/', webIntegration);
      expect(GleanMetrics.promoQrMobile.view).toHaveBeenCalledTimes(1);
    });

    it('does not fire the view event on mobile viewports', () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      renderAtRoute('/', webIntegration);
      expect(GleanMetrics.promoQrMobile.view).not.toHaveBeenCalled();
    });

    it('does not fire when integration is not web', () => {
      mockMatchMedia.mockReturnValue({ matches: true });
      renderAtRoute('/', createIntegration(IntegrationType.OAuthWeb));
      expect(GleanMetrics.promoQrMobile.view).not.toHaveBeenCalled();
    });

    it('does not fire on excluded routes', () => {
      mockMatchMedia.mockReturnValue({ matches: true });
      renderAtRoute('/reset_password', webIntegration);
      expect(GleanMetrics.promoQrMobile.view).not.toHaveBeenCalled();
    });
  });

  describe('content', () => {
    it('renders Firefox logo, heading, description, and QR code', () => {
      renderAtRoute('/', createIntegration(IntegrationType.Web));

      expect(screen.getByAltText('Firefox logo')).toBeInTheDocument();
      expect(screen.getByText('Your phone. Your rules.')).toBeInTheDocument();
      expect(screen.getByText('Scan to get the app')).toBeInTheDocument();
      expect(
        screen.getByAltText(/QR code to download the Firefox mobile app/)
      ).toBeInTheDocument();
    });
  });
});
