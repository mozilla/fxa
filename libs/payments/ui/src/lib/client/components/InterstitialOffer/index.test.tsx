/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterstitialOffer } from './index';
import {
  CancelFlowContentFactory,
  InterstitialOfferPageContentFactory,
} from '@fxa/payments/management/testing';

jest.mock('@fxa/payments/customer', () => ({
  SubplatInterval: {
    Daily: 'daily',
    Weekly: 'weekly',
    Monthly: 'monthly',
    HalfYearly: 'halfyearly',
    Yearly: 'yearly',
  },
  SubPlatPaymentMethodType: {
    Stripe: 'stripe',
    PayPal: 'paypal',
    GoogleIap: 'google_iap',
    AppleIap: 'apple_iap',
  },
}));

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt?: string; className?: string }) => (
    <img alt={alt ?? ''} className={className} src="mock-image" />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('@fxa/shared/react', () => ({
  __esModule: true,
  LinkExternal: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('@fxa/shared/l10n', () => ({
  __esModule: true,
  getLocalizedDateString: () => 'January 1, 2025',
}));

jest.mock('@fxa/shared/assets/images/spinner.svg', () => 'spinner.svg');

const mockCancelSubscriptionAtPeriodEndAction = jest.fn();
jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  cancelSubscriptionAtPeriodEndAction: (...args: unknown[]) =>
    mockCancelSubscriptionAtPeriodEndAction(...args),
}));

const mockAlreadyCanceling = jest.fn();
jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  AlreadyCanceling: (props: Record<string, unknown>) => {
    mockAlreadyCanceling(props);
    return <div data-testid="already-canceling" />;
  },
}));

jest.mock('../BaseButton', () => ({
  __esModule: true,
  BaseButton: ({
    children,
    onClick,
    disabled,
    className,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      type={type as 'button' | 'submit' | 'reset' | undefined}
    >
      {children}
    </button>
  ),
}));

const mockGlean = {
  recordInterstitialOfferView: jest.fn(),
  recordInterstitialOfferEngage: jest.fn(),
  recordInterstitialOfferSubmit: jest.fn(),
  recordInterstitialOfferResult: jest.fn(),
};
jest.mock('../../hooks/useGleanMetrics', () => ({
  __esModule: true,
  useGleanMetrics: () => mockGlean,
}));

const basePageContent = InterstitialOfferPageContentFactory({
  currentInterval: 'monthly',
  modalHeading1: 'Save with yearly',
  modalMessage: ['Switch to yearly and save 50%.'],
  upgradeButtonLabel: 'Upgrade to yearly',
  upgradeButtonUrl: 'https://payments.example.com/en/vpn/yearly/new',
  webIcon: 'https://example.com/icon.png',
  productName: 'Mozilla VPN',
  offeringId: 'vpn',
});

const baseCancelContent = CancelFlowContentFactory({
  currency: 'usd',
  currentPeriodEnd: 1735689600,
  productName: 'Mozilla VPN',
  supportUrl: 'https://support.mozilla.org',
  webIcon: 'https://example.com/icon.png',
});

const baseProps = {
  metricsEnabled: true,
  locale: 'en',
  subscriptionId: 'sub_123',
  pageContent: basePageContent,
  cancelContent: baseCancelContent,
};

describe('InterstitialOffer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('interstitial offer state (default)', () => {
    it('renders the heading text', () => {
      render(<InterstitialOffer {...baseProps} />);
      expect(
        screen.getByRole('heading', { name: 'Save with yearly' })
      ).toBeInTheDocument();
    });

    it('renders the modal message lines', () => {
      render(<InterstitialOffer {...baseProps} />);
      expect(
        screen.getByText('Switch to yearly and save 50%.')
      ).toBeInTheDocument();
    });

    it('renders the upgrade button with the correct URL', () => {
      render(<InterstitialOffer {...baseProps} />);
      const upgradeLink = screen.getByRole('link', {
        name: 'Upgrade to yearly',
      });
      expect(upgradeLink).toHaveAttribute(
        'href',
        'https://payments.example.com/en/vpn/yearly/new'
      );
    });

    it('renders the keep-subscription button', () => {
      render(<InterstitialOffer {...baseProps} />);
      expect(
        screen.getByRole('link', { name: 'Keep monthly subscription' })
      ).toBeInTheDocument();
    });

    it('renders the cancel subscription button', () => {
      render(<InterstitialOffer {...baseProps} />);
      expect(
        screen.getByRole('button', { name: 'Cancel subscription' })
      ).toBeInTheDocument();
    });
  });

  describe('upgrade button URL construction', () => {
    it('merges searchParams into the upgrade button href', () => {
      render(
        <InterstitialOffer
          {...baseProps}
          searchParams={{ utm_source: 'email' }}
        />
      );
      const upgradeLink = screen.getByRole('link', {
        name: 'Upgrade to yearly',
      });
      expect(upgradeLink).toHaveAttribute(
        'href',
        expect.stringContaining('utm_source=email')
      );
    });
  });

  describe('keep-subscription interval text', () => {
    it.each([
      { interval: 'daily', expected: 'Keep daily subscription' },
      { interval: 'weekly', expected: 'Keep weekly subscription' },
      { interval: 'monthly', expected: 'Keep monthly subscription' },
      { interval: 'halfyearly', expected: 'Keep six-month subscription' },
      { interval: undefined, expected: 'Keep subscription' },
    ])(
      'renders "$expected" when currentInterval is $interval',
      ({ interval, expected }) => {
        const pageContent = {
          ...basePageContent,
          currentInterval: interval ?? '',
        };
        render(
          <InterstitialOffer
            {...baseProps}
            pageContent={
              interval === undefined
                ? { ...basePageContent, currentInterval: '' }
                : pageContent
            }
          />
        );
        // For undefined/unrecognized intervals, use the default fallback
        if (interval === undefined) {
          expect(screen.getByText('Keep subscription')).toBeInTheDocument();
        } else {
          expect(screen.getByText(expected)).toBeInTheDocument();
        }
      }
    );
  });

  describe('cancel subscription', () => {
    it('shows cancel success state when cancel action returns ok', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: true });

      render(<InterstitialOffer {...baseProps} />);

      const cancelButton = screen.getByRole('button', {
        name: 'Cancel subscription',
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.getByText('We’re sorry to see you go')
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole('link', { name: 'Back to subscriptions' })
      ).toBeInTheDocument();
    });

    it('shows an error alert when cancel action returns not ok', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: false });

      render(<InterstitialOffer {...baseProps} />);

      const cancelButton = screen.getByRole('button', {
        name: 'Cancel subscription',
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(
        screen.getByText('An unexpected error occurred. Please try again.')
      ).toBeInTheDocument();
    });

    it('shows an error alert when cancel action throws an exception', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockRejectedValue(
        new Error('Network error')
      );

      render(<InterstitialOffer {...baseProps} />);

      const cancelButton = screen.getByRole('button', {
        name: 'Cancel subscription',
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(
        screen.getByText('An unexpected error occurred. Please try again.')
      ).toBeInTheDocument();
    });
  });

  describe('already cancelled state', () => {
    it('renders AlreadyCanceling when cancelAtPeriodEnd is true', () => {
      render(
        <InterstitialOffer
          {...baseProps}
          cancelContent={{ ...baseCancelContent, cancelAtPeriodEnd: true }}
        />
      );
      expect(screen.getByTestId('already-canceling')).toBeInTheDocument();
      expect(mockAlreadyCanceling).toHaveBeenCalledWith(
        expect.objectContaining({
          currentPeriodEnd: 1735689600,
          locale: 'en',
          productName: 'Mozilla VPN',
        })
      );
    });
  });

  describe('Glean metrics', () => {
    it('calls recordInterstitialOfferView on mount when pageContent is present and not cancelAtPeriodEnd', () => {
      render(<InterstitialOffer {...baseProps} />);
      expect(mockGlean.recordInterstitialOfferView).toHaveBeenCalledTimes(1);
      expect(mockGlean.recordInterstitialOfferView).toHaveBeenCalledWith(
        expect.objectContaining({
          offeringId: 'vpn',
          interval: 'monthly',
        })
      );
    });

    it('does not call recordInterstitialOfferView when cancelAtPeriodEnd is true', () => {
      render(
        <InterstitialOffer
          {...baseProps}
          cancelContent={{ ...baseCancelContent, cancelAtPeriodEnd: true }}
        />
      );
      expect(mockGlean.recordInterstitialOfferView).not.toHaveBeenCalled();
    });

    it('calls recordInterstitialOfferEngage with action "offer" when upgrade link is clicked', async () => {
      const user = userEvent.setup();
      // Suppress jsdom "Not implemented: navigation" error from <a> click
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      render(<InterstitialOffer {...baseProps} />);

      const upgradeLink = screen.getByRole('link', {
        name: 'Upgrade to yearly',
      });
      await user.click(upgradeLink);

      expect(mockGlean.recordInterstitialOfferEngage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'offer',
        })
      );
      consoleErrorSpy.mockRestore();
    });

    it('calls recordInterstitialOfferEngage with action "keep_subscription" when keep link is clicked', async () => {
      const user = userEvent.setup();
      // Suppress jsdom "Not implemented: navigation" error from <a> click
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      render(<InterstitialOffer {...baseProps} />);

      const keepLink = screen.getByRole('link', {
        name: 'Keep monthly subscription',
      });
      await user.click(keepLink);

      expect(mockGlean.recordInterstitialOfferEngage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'keep_subscription',
        })
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
