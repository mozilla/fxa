/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChurnCancel } from './index';
import {
  CancelFlowContentFactory,
  CmsChurnInterventionEntryFactory,
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

jest.mock('@radix-ui/react-form');

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockRouterPush = jest.fn();
const mockParams = { locale: 'en', subscriptionId: 'sub_123' };
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockRouterPush }),
  useParams: () => mockParams,
  useSearchParams: () => mockSearchParams,
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

const mockCancelSubscriptionAtPeriodEndAction = jest.fn();
const mockRedeemChurnCouponAction = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  cancelSubscriptionAtPeriodEndAction: (...args: unknown[]) =>
    mockCancelSubscriptionAtPeriodEndAction(...args),
  redeemChurnCouponAction: (...args: unknown[]) =>
    mockRedeemChurnCouponAction(...args),
}));

const mockGetNextChargeChurnContent = jest.fn();
const mockAlreadyCanceling = jest.fn();

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  getNextChargeChurnContent: (...args: unknown[]) =>
    mockGetNextChargeChurnContent(...args),
  AlreadyCanceling: (props: Record<string, unknown>) => {
    mockAlreadyCanceling(props);
    return <div data-testid="already-canceling" />;
  },
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
  ButtonVariant: {
    Primary: 'primary',
    SubscriptionManagementSecondary: 'sub-mgmt-secondary',
  },
}));

jest.mock('@fxa/payments/metrics/client', () => ({
  __esModule: true,
  mapErrorReason: (reason: string) => reason,
}));

const mockGlean = {
  recordRetentionFlowView: jest.fn(),
  recordRetentionFlowEngage: jest.fn(),
  recordRetentionFlowSubmit: jest.fn(),
  recordRetentionFlowResult: jest.fn(),
};

jest.mock('../../hooks/useGleanMetrics', () => ({
  __esModule: true,
  useGleanMetrics: () => mockGlean,
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
jest.mock('@fxa/shared/assets/images/new-window.svg', () => 'new-window.svg');

const baseCmsEntry = CmsChurnInterventionEntryFactory({
  apiIdentifier: 'vpn',
  discountAmount: 20,
  modalHeading: 'Wait! Save 20%',
  modalMessage: ['You can save on your subscription.', 'Keep your access.'],
  interval: 'monthly',
  productPageUrl: 'https://vpn.mozilla.org',
  supportUrl: 'https://support.mozilla.org',
  webIcon: 'https://example.com/icon.png',
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
  subscriptionId: 'sub_123',
  locale: 'en',
  reason: 'eligible',
  cmsChurnInterventionEntry: baseCmsEntry,
  cmsOfferingContent: { successActionButtonUrl: 'https://vpn.mozilla.org' },
  cancelContent: baseCancelContent,
};

describe('ChurnCancel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNextChargeChurnContent.mockReturnValue({
      l10nId: 'mock-next-charge-id',
      l10nVars: { amount: '$9.99' },
    });
  });

  describe('offer state (reason=eligible, active, not canceling)', () => {
    it('renders the modal heading from CMS', () => {
      render(<ChurnCancel {...baseProps} />);
      expect(
        screen.getByRole('heading', { name: 'Wait! Save 20%' })
      ).toBeInTheDocument();
    });

    it('renders each modal message line', () => {
      render(<ChurnCancel {...baseProps} />);
      expect(
        screen.getByText(/You can save on your subscription\./)
      ).toBeInTheDocument();
      expect(screen.getByText(/Keep your access\./)).toBeInTheDocument();
    });

    it('renders the stay subscribed and save button with discount percentage', () => {
      render(<ChurnCancel {...baseProps} />);
      expect(
        screen.getByRole('button', { name: /Stay subscribed and save 20%/ })
      ).toBeInTheDocument();
    });

    it('renders the cancel subscription button', () => {
      render(<ChurnCancel {...baseProps} />);
      expect(
        screen.getByRole('button', { name: /Cancel subscription/ })
      ).toBeInTheDocument();
    });

    it('renders the terms and restrictions link', () => {
      render(<ChurnCancel {...baseProps} />);
      expect(
        screen.getByText(/Limited terms and restrictions apply/)
      ).toBeInTheDocument();
    });
  });

  describe('redeem coupon', () => {
    it('shows success view when redeemChurnCouponAction returns redeemed=true', async () => {
      const user = userEvent.setup();
      mockRedeemChurnCouponAction.mockResolvedValue({ redeemed: true });

      render(<ChurnCancel {...baseProps} />);

      const submitButton = screen.getByRole('button', {
        name: /Stay subscribed and save 20%/,
      });
      await user.click(submitButton);

      expect(
        await screen.findByRole('heading', {
          name: /You’re still subscribed/,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/you’ll save 20% on your next bill/)
      ).toBeInTheDocument();
    });

    it('shows error alert when redeemChurnCouponAction returns redeemed=false', async () => {
      const user = userEvent.setup();
      mockRedeemChurnCouponAction.mockResolvedValue({
        redeemed: false,
        reason: 'coupon_expired',
      });

      render(<ChurnCancel {...baseProps} />);

      const submitButton = screen.getByRole('button', {
        name: /Stay subscribed and save 20%/,
      });
      await user.click(submitButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /An unexpected error occurred/
      );
    });

    it('shows error alert when redeemChurnCouponAction throws', async () => {
      const user = userEvent.setup();
      mockRedeemChurnCouponAction.mockRejectedValue(new Error('Network error'));

      render(<ChurnCancel {...baseProps} />);

      const submitButton = screen.getByRole('button', {
        name: /Stay subscribed and save 20%/,
      });
      await user.click(submitButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /An unexpected error occurred/
      );
    });
  });

  describe('cancel subscription', () => {
    it('shows cancel success view when cancelSubscriptionAtPeriodEndAction returns ok=true', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: true });

      render(<ChurnCancel {...baseProps} />);

      const cancelButton = screen.getByRole('button', {
        name: /Cancel subscription/,
      });
      await user.click(cancelButton);

      expect(
        await screen.findByRole('heading', {
          name: /We’re sorry to see you go/,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Mozilla VPN subscription has been cancelled/)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Back to subscriptions/ })
      ).toHaveAttribute('href', '/en/subscriptions/landing');
    });

    it('shows error alert when cancelSubscriptionAtPeriodEndAction returns ok=false', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: false });

      render(<ChurnCancel {...baseProps} />);

      const cancelButton = screen.getByRole('button', {
        name: /Cancel subscription/,
      });
      await user.click(cancelButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /An unexpected error occurred/
      );
    });

    it('shows error alert when cancelSubscriptionAtPeriodEndAction throws', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockRejectedValue(
        new Error('Server error')
      );

      render(<ChurnCancel {...baseProps} />);

      const cancelButton = screen.getByRole('button', {
        name: /Cancel subscription/,
      });
      await user.click(cancelButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /An unexpected error occurred/
      );
    });
  });

  describe('already canceling state', () => {
    it('renders AlreadyCanceling component with correct props', () => {
      render(
        <ChurnCancel {...baseProps} reason="already_canceling_at_period_end" />
      );

      expect(screen.getByTestId('already-canceling')).toBeInTheDocument();
      expect(mockAlreadyCanceling).toHaveBeenCalledWith({
        currentPeriodEnd: baseCancelContent.currentPeriodEnd,
        locale: 'en',
        productName: 'Mozilla VPN',
        webIcon: 'https://example.com/icon.png',
      });
    });
  });

  describe('discount already applied state', () => {
    it('renders the discount already applied heading', () => {
      render(<ChurnCancel {...baseProps} reason="discount_already_applied" />);

      expect(
        screen.getByText(/Discount code already applied/)
      ).toBeInTheDocument();
    });

    it('renders the manage subscriptions link', () => {
      render(<ChurnCancel {...baseProps} reason="discount_already_applied" />);

      expect(
        screen.getByRole('link', { name: /Manage subscriptions/ })
      ).toHaveAttribute('href', '/en/subscriptions/landing');
    });

    it('renders the contact support link', () => {
      render(<ChurnCancel {...baseProps} reason="discount_already_applied" />);

      expect(
        screen.getByRole('link', { name: /Contact Support/ })
      ).toHaveAttribute('href', 'https://support.mozilla.org');
    });
  });

  describe('default active state', () => {
    it('renders the subscription is active heading', () => {
      render(<ChurnCancel {...baseProps} reason="something_else" />);

      expect(
        screen.getByRole('heading', {
          name: /Your Mozilla VPN subscription is active/,
        })
      ).toBeInTheDocument();
    });

    it('renders the go to product page link', () => {
      render(<ChurnCancel {...baseProps} reason="something_else" />);

      expect(
        screen.getByRole('link', { name: /Go to Mozilla VPN/ })
      ).toBeInTheDocument();
    });

    it('renders the manage subscriptions link', () => {
      render(<ChurnCancel {...baseProps} reason="something_else" />);

      expect(
        screen.getByRole('link', { name: /Manage subscriptions/ })
      ).toHaveAttribute('href', '/en/subscriptions/landing');
    });
  });

  describe('glean metrics', () => {
    it('calls recordRetentionFlowView on mount for eligible state', () => {
      render(<ChurnCancel {...baseProps} />);

      expect(mockGlean.recordRetentionFlowView).toHaveBeenCalledTimes(1);
      expect(mockGlean.recordRetentionFlowView).toHaveBeenCalledWith(
        expect.objectContaining({
          flowType: 'cancel',
          eligibilityStatus: 'cancel',
          offeringId: 'vpn',
          interval: 'monthly',
        })
      );
    });

    it('does not call recordRetentionFlowView when reason is not eligible', () => {
      render(<ChurnCancel {...baseProps} reason="discount_already_applied" />);

      expect(mockGlean.recordRetentionFlowView).not.toHaveBeenCalled();
    });

    it('records engage and submit metrics on redeem coupon click', async () => {
      const user = userEvent.setup();
      mockRedeemChurnCouponAction.mockResolvedValue({ redeemed: true });

      render(<ChurnCancel {...baseProps} />);

      const submitButton = screen.getByRole('button', {
        name: /Stay subscribed and save 20%/,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockGlean.recordRetentionFlowEngage).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'redeem_coupon' })
        );
        expect(mockGlean.recordRetentionFlowSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'redeem_coupon' })
        );
        expect(mockGlean.recordRetentionFlowResult).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'redeem_coupon',
            outcome: 'redeem_success',
          })
        );
      });
    });

    it('records engage and submit metrics on cancel subscription click', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: true });

      render(<ChurnCancel {...baseProps} />);

      const cancelButton = screen.getByRole('button', {
        name: /Cancel subscription/,
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockGlean.recordRetentionFlowEngage).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'cancel_subscription' })
        );
        expect(mockGlean.recordRetentionFlowSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'cancel_subscription' })
        );
        expect(mockGlean.recordRetentionFlowResult).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'cancel_subscription',
            outcome: 'customer_canceled',
          })
        );
      });
    });
  });
});
