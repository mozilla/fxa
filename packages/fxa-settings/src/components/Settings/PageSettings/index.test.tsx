/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import PageSettings from '.';
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';
import * as Metrics from '../../../lib/metrics';
import GleanMetrics from '../../../lib/glean';
import { AppContext } from '../../../models';
import { mockWebIntegration } from '../../../pages/Signin/SigninRecoveryCode/mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { Constants } from '../../../lib/constants';
import {
  accountEligibleForRecoveryKey,
  accountEligibleForRecoveryPhoneAndKey,
  accountEligibleForRecoveryPhoneOnly,
  coldStartAccount,
  completelyFilledOutAccount,
} from './mocks';

jest.mock('../../../models/AlertBarInfo');

jest.mock('../../../lib/metrics', () => ({
  setProperties: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      view: jest.fn(),
      promoMonitorView: jest.fn(),
    },
    deleteAccount: {
      settingsSubmit: jest.fn(),
    },
    accountBanner: {
      addRecoveryPhoneView: jest.fn(),
      createRecoveryKeyView: jest.fn(),
      reactivationSuccessView: jest.fn(),
    },
  },
}));

const mockUseGeoEligibilityCheck = jest
  .fn()
  .mockReturnValue({ eligible: false });
jest.mock('../../../lib/hooks/useGeoEligibilityCheck', () => ({
  useGeoEligibilityCheck: () => mockUseGeoEligibilityCheck(),
}));

const mockGetProductPromoData = jest.fn().mockReturnValue({
  hidePromo: false,
  showMonitorPlusPromo: false,
  gleanEvent: { event: { reason: 'default' } },
});
jest.mock('../ProductPromo', () => ({
  __esModule: true,
  default: () => <div>Product Promo</div>,
  getProductPromoData: () => mockGetProductPromoData(),
}));

beforeEach(() => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

describe('PageSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders without imploding', async () => {
    renderWithRouter(
      <AppContext.Provider
        value={mockAppContext({ account: coldStartAccount })}
      >
        <PageSettings />
      </AppContext.Provider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('settings-profile')).toBeInTheDocument()
    );
    expect(screen.getByTestId('settings-security')).toBeInTheDocument();
    expect(
      screen.getByTestId('settings-connected-services')
    ).toBeInTheDocument();
    expect(screen.getByTestId('settings-delete-account')).toBeInTheDocument();
    expect(
      screen.queryByTestId('settings-data-collection')
    ).toBeInTheDocument();
    expect(Metrics.setProperties).toHaveBeenCalledWith({
      lang: null,
      uid: 'abc123',
    });
  });

  it('renders without imploding when passing an integration', async () => {
    renderWithRouter(
      <AppContext.Provider
        value={mockAppContext({ account: coldStartAccount })}
      >
        <PageSettings integration={mockWebIntegration} />
      </AppContext.Provider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('settings-profile')).toBeInTheDocument()
    );
    expect(screen.getByTestId('settings-security')).toBeInTheDocument();
    expect(
      screen.getByTestId('settings-connected-services')
    ).toBeInTheDocument();
    expect(screen.getByTestId('settings-delete-account')).toBeInTheDocument();
    expect(
      screen.queryByTestId('settings-data-collection')
    ).toBeInTheDocument();
    expect(Metrics.setProperties).toHaveBeenCalledWith({
      lang: null,
      uid: 'abc123',
    });
  });

  describe('glean metrics', () => {
    it('emits the expected event on render', async () => {
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({ account: coldStartAccount })}
        >
          <PageSettings />
        </AppContext.Provider>
      );
      await waitFor(() =>
        expect(GleanMetrics.accountPref.view).toHaveBeenCalled()
      );
    });

    it('emits the expected event on click of Delete account button', async () => {
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({ account: coldStartAccount })}
        >
          <PageSettings />
        </AppContext.Provider>
      );
      await userEvent.click(
        screen.getByRole('link', { name: 'Delete account' })
      );
      expect(GleanMetrics.deleteAccount.settingsSubmit).toHaveBeenCalled();
    });

    describe('product promo event', () => {
      it('user does not have Monitor', async () => {
        renderWithRouter(
          <AppContext.Provider
            value={mockAppContext({ account: coldStartAccount })}
          >
            <PageSettings />
          </AppContext.Provider>
        );
        await waitFor(() =>
          expect(
            GleanMetrics.accountPref.promoMonitorView
          ).toHaveBeenCalledTimes(1)
        );
        expect(GleanMetrics.accountPref.promoMonitorView).toHaveBeenCalledWith({
          event: { reason: 'default' },
        });
      });

      it('user has Monitor and is eligible for special promo', async () => {
        mockUseGeoEligibilityCheck.mockReturnValue({
          eligible: true,
          loading: false,
        });
        mockGetProductPromoData.mockReturnValue({
          hidePromo: false,
          showMonitorPlusPromo: true,
          gleanEvent: { event: { reason: 'special' } },
        });
        renderWithRouter(
          <AppContext.Provider
            value={mockAppContext({ account: completelyFilledOutAccount })}
          >
            <PageSettings />
          </AppContext.Provider>
        );
        await waitFor(() =>
          expect(
            GleanMetrics.accountPref.promoMonitorView
          ).toHaveBeenCalledTimes(1)
        );
        expect(GleanMetrics.accountPref.promoMonitorView).toHaveBeenCalledWith({
          event: { reason: 'special' },
        });
      });

      it('user has all products and subscriptions', async () => {
        mockUseGeoEligibilityCheck.mockReturnValue({
          eligible: true,
          loading: false,
        });
        mockGetProductPromoData.mockReturnValue({
          hidePromo: true,
        });
        renderWithRouter(
          <AppContext.Provider
            value={mockAppContext({ account: completelyFilledOutAccount })}
          >
            <PageSettings />
          </AppContext.Provider>
        );
        await waitFor(() =>
          expect(
            GleanMetrics.accountPref.promoMonitorView
          ).not.toHaveBeenCalled()
        );
      });
    });

    describe('inactive account verified', () => {
      const alertBarInfo = {
        success: jest.fn(),
      } as any;
      const settingsContext = mockSettingsContext({ alertBarInfo });

      it('user has seen the reactivation banner', async () => {
        mockWebIntegration.data.utmCampaign =
          'fx-account-inactive-reminder-third';
        mockWebIntegration.data.utmMedium = 'email';
        mockWebIntegration.data.utmContent = 'fx-account-deletion';
        renderWithRouter(
          <AppContext.Provider
            value={mockAppContext({ account: coldStartAccount })}
          >
            <SettingsContext.Provider value={settingsContext}>
              <PageSettings integration={mockWebIntegration} />
            </SettingsContext.Provider>
          </AppContext.Provider>
        );

        await waitFor(() =>
          expect(alertBarInfo.success).toHaveBeenCalledWith(
            'Signed in successfully. Your Mozilla account and data will stay active.'
          )
        );
        expect(
          GleanMetrics.accountBanner.reactivationSuccessView
        ).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('feature promotion banners', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('shows phone banner when eligible', async () => {
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: accountEligibleForRecoveryPhoneOnly,
          })}
        >
          <PageSettings integration={mockWebIntegration} />
        </AppContext.Provider>
      );
      await waitFor(() =>
        expect(
          screen.getByTestId('submit_add_recovery_phone')
        ).toBeInTheDocument()
      );
    });

    it('shows key banner when eligible', async () => {
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({ account: accountEligibleForRecoveryKey })}
        >
          <PageSettings integration={mockWebIntegration} />
        </AppContext.Provider>
      );
      await waitFor(() =>
        expect(
          screen.getByTestId('submit_create_recovery_key')
        ).toBeInTheDocument()
      );
    });

    it('prioritizes recovery phone banner when eligible for both', async () => {
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: accountEligibleForRecoveryPhoneAndKey,
          })}
        >
          <PageSettings integration={mockWebIntegration} />
        </AppContext.Provider>
      );

      await waitFor(() =>
        expect(
          screen.getByTestId('submit_add_recovery_phone')
        ).toBeInTheDocument()
      );
      expect(
        screen.queryByTestId('submit_create_recovery_key')
      ).not.toBeInTheDocument();
    });

    it('does not show phone banner if eligible but dismissed', async () => {
      localStorage.setItem(
        Constants.DISABLE_PROMO_RECOVERY_PHONE_BANNER,
        'true'
      );

      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: accountEligibleForRecoveryPhoneOnly,
          })}
        >
          <PageSettings integration={mockWebIntegration} />
        </AppContext.Provider>
      );
      await waitFor(() =>
        expect(
          screen.queryByTestId('submit_add_recovery_phone')
        ).not.toBeInTheDocument()
      );
    });

    it('does not show key banner if eligible but dismissed', async () => {
      localStorage.setItem(
        Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_BANNER,
        'true'
      );

      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: accountEligibleForRecoveryKey,
          })}
        >
          <PageSettings integration={mockWebIntegration} />
        </AppContext.Provider>
      );
      await waitFor(() =>
        expect(
          screen.queryByTestId('submit_create_recovery_key')
        ).not.toBeInTheDocument()
      );
    });

    it('shows key banner when phone is dismissed', async () => {
      localStorage.setItem(
        Constants.DISABLE_PROMO_RECOVERY_PHONE_BANNER,
        'true'
      );
      renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: accountEligibleForRecoveryPhoneAndKey,
          })}
        >
          <PageSettings integration={mockWebIntegration} />
        </AppContext.Provider>
      );
      await waitFor(() =>
        expect(
          screen.getByTestId('submit_create_recovery_key')
        ).toBeInTheDocument()
      );
      expect(
        screen.queryByTestId('submit_add_recovery_phone')
      ).not.toBeInTheDocument();
    });
  });
});
