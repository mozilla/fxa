/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import PromotionBanner, {
  AccountRecoveryKeyPromoBanner,
  RecoveryPhonePromoBanner,
} from '.';
import keyImage from './key.svg';
import GleanMetrics from '../../lib/glean';

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: () => {
    return {
      pathname: '/settings',
    };
  },
}));

describe('PromotionBanner component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it('renders as expected', () => {
    const notificationProps = {
      image: keyImage,
      ctaText: 'Create',
      heading: 'Don’t lose your data if you forget your password',
      description:
        'Create an Account Recovery Key to restore your sync browsing data if you ever forget your password.',
      route: '/settings/account_recovery',
      dismissKey: 'account-recovery-dismissed',
      metricsKey: 'create_recovery_key',
    };
    renderWithLocalizationProvider(<PromotionBanner {...notificationProps} />);
    screen.getByText('Create');
    screen.getByText('Don’t lose your data if you forget your password');
    screen.getByText(
      'Create an Account Recovery Key to restore your sync browsing data if you ever forget your password.'
    );
  });

  it('can be dismissed', async () => {
    const notificationProps = {
      image: keyImage,
      ctaText: 'Create',
      heading: 'Don’t lose your data if you forget your password',
      description:
        'Create an Account Recovery Key to restore your sync browsing data if you ever forget your password.',
      route: '/settings/account_recovery',
      dismissKey: 'account-recovery-dismissed',
      metricsKey: 'create_recovery_key',
    };
    renderWithLocalizationProvider(<PromotionBanner {...notificationProps} />);

    const cta = screen.queryByRole('link', { name: 'Create' });

    let key = localStorage.getItem(
      '__fxa_storage.fxa_disable_notification_banner.account-recovery-dismissed'
    );
    expect(key).toBeNull();
    expect(cta).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-account-recovery-dismissed'));

    key = localStorage.getItem(
      '__fxa_storage.fxa_disable_notification_banner.account-recovery-dismissed'
    );
    expect(key).toBe('true');
    await waitFor(() => expect(cta).not.toBeInTheDocument());
  });

  describe('recovery key promotion banner', () => {
    it('renders as expected', () => {
      renderWithLocalizationProvider(<AccountRecoveryKeyPromoBanner />);
      expect(
        screen.getByText('Don’t lose your data if you forget your password')
      ).toBeVisible();
      expect(
        screen.getByText(
          'Create an account recovery key to restore your sync browsing data if you ever forget your password.'
        )
      ).toBeVisible();
      expect(screen.getAllByRole('link')).toHaveLength(1);
      const cta = screen.getByRole('link', { name: 'Create' });
      expect(cta).toBeVisible();
      expect(cta).toHaveAttribute('href', '/settings/account_recovery');
      expect(cta).toHaveAttribute(
        'data-glean-id',
        'account_banner_create_recovery_key_submit'
      );
    });

    it('submits the expected view metric on render', async () => {
      const viewSpy = jest.spyOn(
        GleanMetrics.accountBanner,
        'createRecoveryKeyView'
      );
      renderWithLocalizationProvider(<AccountRecoveryKeyPromoBanner />);

      expect(viewSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('recovery phone promotion banner', () => {
    it('renders as expected', () => {
      renderWithLocalizationProvider(<RecoveryPhonePromoBanner />);
      expect(
        screen.getByText(
          'Add extra protection to your account with a recovery phone'
        )
      ).toBeVisible();
      expect(
        screen.getByText(
          'Now you can sign in with a one-time-password via SMS if you can’t use your two-step authenticator app.'
        )
      ).toBeVisible();
      const moreInfoLink = screen.getByRole('link', {
        name: /Learn more about recovery and SIM swap risk/,
      });
      expect(screen.getAllByRole('link')).toHaveLength(2);
      expect(moreInfoLink).toBeVisible();
      expect(moreInfoLink).toHaveAttribute(
        'href',
        'https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication'
      );
      const cta = screen.getByRole('link', { name: 'Add recovery phone' });
      expect(cta).toBeVisible();
      expect(cta).toHaveAttribute('href', '/settings/recovery_phone/setup');
      expect(cta).toHaveAttribute(
        'data-glean-id',
        'account_banner_add_recovery_phone_submit'
      );
    });

    it('submits the expected view metric on render', async () => {
      const viewSpy = jest.spyOn(
        GleanMetrics.accountBanner,
        'addRecoveryPhoneView'
      );
      renderWithLocalizationProvider(<RecoveryPhonePromoBanner />);

      expect(viewSpy).toHaveBeenCalledTimes(1);
    });
  });
});
