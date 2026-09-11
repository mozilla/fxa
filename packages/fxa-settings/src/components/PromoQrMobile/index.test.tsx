/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { PromoQrMobile, PromoQrMobileIntegration } from '.';
import { IntegrationType } from '../../models/integrations';
import { renderWithRouter } from '../../models/mocks';
import GleanMetrics from '../../lib/glean';
import {
  NimbusContext,
  NimbusContextValue,
} from '../../models/contexts/NimbusContext';

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

function createIntegration(
  type: IntegrationType,
  isDesktopSync = false
): PromoQrMobileIntegration {
  return { type, isDesktopSync: () => isDesktopSync };
}

const NIMBUS_USER_ID = 'nimbus-user-id';

function nimbusValue({
  loading = false,
  ...feature
}: {
  enabled?: boolean;
  branch?: string;
  heading?: string;
  description?: string;
  qrUrl?: string;
  loading?: boolean;
}): NimbusContextValue {
  return {
    experiments: {
      nimbusUserId: NIMBUS_USER_ID,
      enrollments: [],
      features: { 'promo-qr-mobile': feature },
    },
    loading,
  };
}

function renderAtRoute(
  pathname: string,
  integration: PromoQrMobileIntegration,
  nimbus?: NimbusContextValue,
  promoQrImageUrl?: string,
  cmsLoading?: boolean
) {
  const ui = (
    <PromoQrMobile
      integration={integration}
      promoQrImageUrl={promoQrImageUrl}
      cmsLoading={cmsLoading}
    />
  );
  return renderWithRouter(
    nimbus ? (
      <NimbusContext.Provider value={nimbus}>{ui}</NimbusContext.Provider>
    ) : (
      ui
    ),
    { route: pathname }
  );
}

const webIntegration = createIntegration(IntegrationType.Web);

function qrImage() {
  return screen.getByAltText(
    /QR code to download the Firefox mobile app/
  ) as HTMLImageElement;
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

    it('renders for desktop sync integrations', () => {
      renderAtRoute('/', createIntegration(IntegrationType.OAuthNative, true));
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('does not render for OAuth integrations', () => {
      renderAtRoute('/', createIntegration(IntegrationType.OAuthWeb));
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('does not render for non-sync OAuth native integrations', () => {
      renderAtRoute('/', createIntegration(IntegrationType.OAuthNative));
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  describe('visibility based on route', () => {
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

  describe('Nimbus loading', () => {
    it('renders nothing while Nimbus is loading, so the control does not paint and swap', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: true, branch: 'treatment-a', loading: true })
      );
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('does not fire the view event while loading', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: true, branch: 'treatment-a', loading: true })
      );
      expect(GleanMetrics.promoQrMobile.view).not.toHaveBeenCalled();
    });
  });

  describe('CMS loading', () => {
    it('renders nothing while the CMS fetch is in flight', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: true, branch: 'treatment-a' }),
        undefined,
        true
      );
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('does not report a treatment before the CMS override arrives', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: true, branch: 'treatment-a' }),
        undefined,
        true
      );
      expect(GleanMetrics.promoQrMobile.view).not.toHaveBeenCalled();
    });
  });

  describe('Glean view event', () => {
    it('fires the view event once on desktop', () => {
      renderAtRoute('/', webIntegration);
      expect(GleanMetrics.promoQrMobile.view).toHaveBeenCalledTimes(1);
    });

    it('fires the view event once on desktop for desktop sync integrations', () => {
      renderAtRoute('/', createIntegration(IntegrationType.OAuthNative, true));
      expect(GleanMetrics.promoQrMobile.view).toHaveBeenCalledTimes(1);
    });

    it('does not fire the view event on mobile viewports', () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      renderAtRoute('/', webIntegration);
      expect(GleanMetrics.promoQrMobile.view).not.toHaveBeenCalled();
    });

    it('does not fire for OAuth web integrations', () => {
      renderAtRoute('/', createIntegration(IntegrationType.OAuthWeb));
      expect(GleanMetrics.promoQrMobile.view).not.toHaveBeenCalled();
    });

    it('does not fire on excluded routes', () => {
      renderAtRoute('/reset_password', webIntegration);
      expect(GleanMetrics.promoQrMobile.view).not.toHaveBeenCalled();
    });

    it('reports the branch and the Nimbus user id when enrolled', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: true, branch: 'treatment-e' })
      );
      expect(GleanMetrics.promoQrMobile.view).toHaveBeenCalledWith({
        event: { nimbusUserId: NIMBUS_USER_ID, branch: 'treatment-e' },
      });
    });

    it('reports the control when an enrolled arm names no branch', () => {
      renderAtRoute('/', webIntegration, nimbusValue({ enabled: true }));
      expect(GleanMetrics.promoQrMobile.view).toHaveBeenCalledWith({
        event: { nimbusUserId: NIMBUS_USER_ID, branch: 'control' },
      });
    });

    it('reports no branch when the feature is disabled', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: false, branch: 'treatment-a' })
      );
      expect(GleanMetrics.promoQrMobile.view).toHaveBeenCalledWith({
        event: { nimbusUserId: NIMBUS_USER_ID, branch: undefined },
      });
    });
  });

  describe('content', () => {
    it('renders the control heading, the CTA, and the QR code', () => {
      renderAtRoute('/', webIntegration);

      expect(screen.getByText('Your phone. Your rules.')).toBeInTheDocument();
      expect(
        screen.getByText('Scan to download mobile app')
      ).toBeInTheDocument();
      expect(qrImage()).toBeInTheDocument();
    });

    it('does not render a separate Firefox logo, since the QR carries the glyph', () => {
      renderAtRoute('/', webIntegration);
      expect(screen.queryByAltText('Firefox logo')).not.toBeInTheDocument();
    });

    it('renders the control QR when there is no experiment', () => {
      renderAtRoute('/', webIntegration);
      expect(qrImage().src).toContain('control');
    });

    it('renders the heading the experiment supplies', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({
          enabled: true,
          branch: 'treatment-a',
          heading: 'Pick up where you left off, wherever you go',
        })
      );
      expect(
        screen.getByText('Pick up where you left off, wherever you go')
      ).toBeInTheDocument();
    });

    it('renders the description the experiment supplies', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({
          enabled: true,
          branch: 'treatment-a',
          description: 'Point your camera here',
        })
      );
      expect(screen.getByText('Point your camera here')).toBeInTheDocument();
    });

    it('renders the QR the experiment supplies when it is FxA hosted', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({
          enabled: true,
          branch: 'treatment-a',
          qrUrl: '/settings/static/qr/treatment-a.svg',
        })
      );
      expect(qrImage().src).toContain('/settings/static/qr/treatment-a.svg');
    });

    it('keeps the control copy for fields the arm leaves unset', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: true, branch: 'treatment-a' })
      );

      expect(screen.getByText('Your phone. Your rules.')).toBeInTheDocument();
      expect(
        screen.getByText('Scan to download mobile app')
      ).toBeInTheDocument();
      expect(qrImage().src).toContain('control');
    });

    it('falls back to the control QR for a qrUrl off the FxA origins', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({
          enabled: true,
          branch: 'treatment-a',
          qrUrl: 'https://evil.example.net/qr.svg',
        })
      );
      expect(qrImage().src).toContain('control');
    });

    it('ignores the arm when the feature is disabled', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({
          enabled: false,
          branch: 'treatment-a',
          heading: 'Pick up where you left off, wherever you go',
        })
      );

      expect(screen.getByText('Your phone. Your rules.')).toBeInTheDocument();
      expect(qrImage().src).toContain('control');
    });
  });

  describe('CMS override', () => {
    it('uses the CMS-provided QR image URL when the prop is set', () => {
      renderAtRoute(
        '/',
        webIntegration,
        undefined,
        'https://example.com/custom-qr.svg'
      );
      expect(qrImage().src).toBe('https://example.com/custom-qr.svg');
    });

    it('forces the control copy, because a CMS image carries no branch', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: true, branch: 'treatment-a' }),
        'https://example.com/custom-qr.svg'
      );

      expect(screen.getByText('Your phone. Your rules.')).toBeInTheDocument();
      expect(qrImage().src).toBe('https://example.com/custom-qr.svg');
    });

    it('leaves CMS users out of the experiment', () => {
      renderAtRoute(
        '/',
        webIntegration,
        nimbusValue({ enabled: true, branch: 'treatment-a' }),
        'https://example.com/custom-qr.svg'
      );
      expect(GleanMetrics.promoQrMobile.view).toHaveBeenCalledWith({
        event: { nimbusUserId: NIMBUS_USER_ID, branch: undefined },
      });
    });

    it.each([
      'javascript:alert(1)',
      'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
      'not-a-url',
      '',
    ])(
      'ignores invalid CMS URLs (%s) and falls back to the branch QR',
      (url) => {
        renderAtRoute('/', webIntegration, undefined, url);
        expect(qrImage().src).toContain('control');
      }
    );
  });
});
