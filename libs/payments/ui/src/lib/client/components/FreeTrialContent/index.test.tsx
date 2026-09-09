/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FreeTrialContent } from './index';
import { TrialSubscriptionContentFactory } from '@fxa/payments/management/testing';

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLocalization: () => ({
    l10n: {
      getString: (_id: string, _vars: unknown, fallback: string) =>
        fallback || _id,
    },
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt?: string; className?: string }) => (
    <img alt={alt ?? ''} className={className} src="mock-image" />
  ),
}));

const mockCancelSubscriptionAtPeriodEndAction = jest.fn();
const mockCancelSubscriptionImmediatelyAction = jest.fn();
const mockResubscribeSubscriptionAction = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  cancelSubscriptionAtPeriodEndAction: (...args: unknown[]) =>
    mockCancelSubscriptionAtPeriodEndAction(...args),
  cancelSubscriptionImmediatelyAction: (...args: unknown[]) =>
    mockCancelSubscriptionImmediatelyAction(...args),
  resubscribeSubscriptionAction: (...args: unknown[]) =>
    mockResubscribeSubscriptionAction(...args),
}));

jest.mock('@fxa/shared/l10n', () => ({
  __esModule: true,
  getLocalizedCurrencyString: (amount: number, _currency: string) =>
    `$${(amount / 100).toFixed(2)}`,
  getLocalizedDateString: () => 'January 1, 2025',
}));

jest.mock('@fxa/shared/react', () => ({
  __esModule: true,
  LinkExternal: ({
    children,
    href,
    className,
    'data-testid': testId,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    'data-testid'?: string;
    'aria-label'?: string;
  }) => (
    <a
      href={href}
      className={className}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  ),
}));

jest.mock('@fxa/shared/assets/images/alert-yellow.svg', () => 'alert.svg');
jest.mock('@fxa/shared/assets/images/infoBlack.svg', () => 'info.svg');
jest.mock('@fxa/shared/assets/images/new-window.svg', () => 'new-window.svg');
jest.mock('@fxa/shared/assets/images/spinner.svg', () => 'spinner.svg');

jest.mock('@fxa/payments/customer', () => ({
  SubplatInterval: {
    Daily: 'daily',
    Weekly: 'weekly',
    Monthly: 'monthly',
    HalfYearly: 'halfyearly',
    Yearly: 'yearly',
  },
}));

const baseTrialFromFactory = TrialSubscriptionContentFactory({
  id: 'sub_trial_123',
  productName: 'Mozilla VPN',
  offeringApiIdentifier: 'vpn',
  supportUrl: 'https://support.mozilla.org',
  webIcon: 'https://example.com/icon.png',
  currency: 'usd',
  cancelAtPeriodEnd: false,
  trialEnd: 1735689600,
  nextInvoiceTotal: 999,
  nextInvoiceTax: 100,
  conversionStatus: 'active',
});

const baseTrial = {
  ...baseTrialFromFactory,
  interval: 'monthly' as string,
};

const baseProps = {
  trial: baseTrial,
  locale: 'en',
};

describe('FreeTrialContent', () => {
  beforeEach(() => {
    mockCancelSubscriptionAtPeriodEndAction.mockReset();
    mockCancelSubscriptionImmediatelyAction.mockReset();
    mockResubscribeSubscriptionAction.mockReset();
  });

  describe('Active trial state', () => {
    it('renders charge info with tax when nextInvoiceTax is present', () => {
      render(<FreeTrialContent {...baseProps} />);

      expect(
        screen.getByText(
          /You will be charged \$9\.99 \+ \$1\.00 tax per month after the free trial ends on January 1, 2025/i
        )
      ).toBeInTheDocument();
    });

    it('renders charge info without tax when nextInvoiceTax is absent', () => {
      render(
        <FreeTrialContent
          {...baseProps}
          trial={{ ...baseTrial, nextInvoiceTax: undefined }}
        />
      );

      expect(
        screen.getByText(
          /You will be charged \$9\.99 per month after the free trial ends on January 1, 2025/i
        )
      ).toBeInTheDocument();
    });

    it('renders "Cancel trial" button when trial is active', () => {
      render(<FreeTrialContent {...baseProps} />);

      expect(
        screen.getByRole('button', { name: /Cancel trial for Mozilla VPN/i })
      ).toBeInTheDocument();
    });

    it('shows cancelled state after successful cancel', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: true });

      render(<FreeTrialContent {...baseProps} />);

      await user.click(
        screen.getByRole('button', { name: /Cancel trial for Mozilla VPN/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Resume trial for Mozilla VPN/i })
        ).toBeInTheDocument();
      });
    });

    it('shows error when cancel fails', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: false });

      render(<FreeTrialContent {...baseProps} />);

      await user.click(
        screen.getByRole('button', { name: /Cancel trial for Mozilla VPN/i })
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Cancelled trial state', () => {
    it('renders trial expiration warning with date', () => {
      render(
        <FreeTrialContent
          {...baseProps}
          trial={{ ...baseTrial, cancelAtPeriodEnd: true }}
        />
      );

      expect(
        screen.getByText(/Your free trial expires on January 1, 2025/i)
      ).toBeInTheDocument();
    });

    it('renders trial cancelled text when no trialEnd date', () => {
      render(
        <FreeTrialContent
          {...baseProps}
          trial={{ ...baseTrial, cancelAtPeriodEnd: true, trialEnd: null }}
        />
      );

      expect(
        screen.getByText(/Your free trial has been cancelled/i)
      ).toBeInTheDocument();
    });

    it('renders "Resume trial" button', () => {
      render(
        <FreeTrialContent
          {...baseProps}
          trial={{ ...baseTrial, cancelAtPeriodEnd: true }}
        />
      );

      expect(
        screen.getByRole('button', { name: /Resume trial for Mozilla VPN/i })
      ).toBeInTheDocument();
    });

    it('resumes trial after successful resubscribe', async () => {
      const user = userEvent.setup();
      mockResubscribeSubscriptionAction.mockResolvedValue({ ok: true });

      render(
        <FreeTrialContent
          {...baseProps}
          trial={{ ...baseTrial, cancelAtPeriodEnd: true }}
        />
      );

      await user.click(
        screen.getByRole('button', { name: /Resume trial for Mozilla VPN/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Cancel trial for Mozilla VPN/i })
        ).toBeInTheDocument();
      });
    });

    it('shows error when resume fails', async () => {
      const user = userEvent.setup();
      mockResubscribeSubscriptionAction.mockResolvedValue({ ok: false });

      render(
        <FreeTrialContent
          {...baseProps}
          trial={{ ...baseTrial, cancelAtPeriodEnd: true }}
        />
      );

      await user.click(
        screen.getByRole('button', { name: /Resume trial for Mozilla VPN/i })
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Past due state', () => {
    const pastDueTrial = {
      ...baseTrial,
      conversionStatus: 'past_due' as const,
      failedInvoiceDate: 1735000000,
      failedInvoiceTotal: 999,
      failedInvoiceTax: 100,
      failedInvoiceUrl: 'https://invoice.stripe.com/inv_123',
    };

    it('renders last bill date', () => {
      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      expect(screen.getByText(/Last bill/i)).toBeInTheDocument();
    });

    it('renders failed invoice amount with tax', () => {
      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      expect(screen.getByText(/\$9\.99/)).toBeInTheDocument();
      expect(screen.getByText(/\$1\.00 tax/i)).toBeInTheDocument();
    });

    it('renders "View invoice" link when failedInvoiceUrl is present', () => {
      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      expect(
        screen.getByTestId('free-trial-link-view-invoice')
      ).toHaveAttribute('href', 'https://invoice.stripe.com/inv_123');
    });

    it('does not render "View invoice" link when failedInvoiceUrl is absent', () => {
      render(
        <FreeTrialContent
          {...baseProps}
          trial={{ ...pastDueTrial, failedInvoiceUrl: null }}
        />
      );

      expect(
        screen.queryByTestId('free-trial-link-view-invoice')
      ).not.toBeInTheDocument();
    });

    it('renders "Update payment method" button when updatePaymentUrl is provided', () => {
      render(
        <FreeTrialContent
          {...baseProps}
          trial={pastDueTrial}
          updatePaymentUrl="https://payments.example.com/update"
        />
      );

      expect(
        screen.getByRole('link', { name: /Update payment method/i })
      ).toHaveAttribute('href', 'https://payments.example.com/update');
    });

    it('does not render "Update payment method" when updatePaymentUrl is absent', () => {
      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      expect(
        screen.queryByRole('link', { name: /Update payment method/i })
      ).not.toBeInTheDocument();
    });

    it('renders "Cancel subscription" button', () => {
      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      expect(
        screen.getByRole('button', {
          name: /Cancel subscription for Mozilla VPN/i,
        })
      ).toBeInTheDocument();
    });

    it('cancels subscription immediately on button click', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionImmediatelyAction.mockResolvedValue({ ok: true });

      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      await user.click(
        screen.getByRole('button', {
          name: /Cancel subscription for Mozilla VPN/i,
        })
      );

      await waitFor(() => {
        expect(mockCancelSubscriptionImmediatelyAction).toHaveBeenCalledWith(
          'sub_trial_123'
        );
      });
    });

    // Note: The past-due branch of FreeTrialContent returns early without
    // rendering the showActionError block. The error state is set but not
    // displayed. This is a known component gap (not tested here).
    it('does not render error alert in past-due state even when cancel fails', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionImmediatelyAction.mockResolvedValue({ ok: false });

      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      await user.click(
        screen.getByRole('button', {
          name: /Cancel subscription for Mozilla VPN/i,
        })
      );

      await waitFor(() => {
        expect(mockCancelSubscriptionImmediatelyAction).toHaveBeenCalledWith(
          'sub_trial_123'
        );
      });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders trial ended message with date', () => {
      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      expect(screen.getByText(/Your free trial ended on/i)).toBeInTheDocument();
    });

    it('renders payment processing message', () => {
      render(<FreeTrialContent {...baseProps} trial={pastDueTrial} />);

      expect(
        screen.getByText(/couldn’t process your payment/i)
      ).toBeInTheDocument();
    });
  });

  describe('Interval-specific charge info', () => {
    it.each([
      { interval: 'daily', expected: /per day/ },
      { interval: 'weekly', expected: /per week/ },
      { interval: 'monthly', expected: /per month/ },
      { interval: 'halfyearly', expected: /every six months/ },
      { interval: 'yearly', expected: /per year/ },
    ])(
      'renders correct text for $interval interval',
      ({ interval, expected }) => {
        render(
          <FreeTrialContent
            {...baseProps}
            trial={{ ...baseTrial, interval, nextInvoiceTax: undefined }}
          />
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
      }
    );
  });
});
