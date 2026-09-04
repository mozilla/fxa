/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChurnStaySubscribed } from './index';
import {
  CmsChurnInterventionEntryFactory,
  StaySubscribedFlowContentFactory,
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
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
    'aria-label'?: string;
  }) => (
    <a
      href={href}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  ),
}));

const mockRedeemChurnCouponAction = jest.fn();
const mockResubscribeSubscriptionAction = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  redeemChurnCouponAction: (...args: unknown[]) =>
    mockRedeemChurnCouponAction(...args),
  resubscribeSubscriptionAction: (...args: unknown[]) =>
    mockResubscribeSubscriptionAction(...args),
}));

jest.mock('@fxa/payments/metrics/client', () => ({
  __esModule: true,
  mapErrorReason: (reason: string) => reason,
}));

const mockGetNextChargeChurnContent = jest.fn();

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  getNextChargeChurnContent: (...args: unknown[]) =>
    mockGetNextChargeChurnContent(...args),
  ButtonVariant: {
    Primary: 'primary',
  },
  SubmitButton: ({
    children,
    className,
    disabled,
  }: {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
  }) => (
    <button type="submit" className={className} disabled={disabled}>
      {children}
    </button>
  ),
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

jest.mock('@fxa/shared/assets/images/spinner.svg', () => 'spinner.svg');
jest.mock('@fxa/shared/assets/images/new-window.svg', () => 'new-window.svg');

const baseCmsEntry = CmsChurnInterventionEntryFactory({
  apiIdentifier: 'vpn',
  churnType: 'stay_subscribed',
  discountAmount: 0,
  modalHeading: 'Wait! Save 20%',
  modalMessage: ['Keep your subscription and save.', 'Limited time offer.'],
  interval: 'monthly',
  productPageUrl: 'https://vpn.mozilla.org',
  supportUrl: 'https://support.mozilla.org',
  webIcon: 'https://example.com/icon.png',
});

const baseStaySubscribedContent = StaySubscribedFlowContentFactory({
  currency: 'usd',
  currentPeriodEnd: 1735689600,
  productName: 'Mozilla VPN',
  webIcon: 'https://example.com/icon.png',
});

const baseProps = {
  metricsEnabled: true,
  subscriptionId: 'sub_123',
  locale: 'en',
  reason: 'eligible',
  cmsChurnInterventionEntry: baseCmsEntry,
  cmsOfferingContent: { successActionButtonUrl: 'https://vpn.mozilla.org' },
  staySubscribedContent: baseStaySubscribedContent,
};

describe('ChurnStaySubscribed', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockRedeemChurnCouponAction.mockReset();
    mockResubscribeSubscriptionAction.mockReset();
    mockGetNextChargeChurnContent.mockReset();
    mockGlean.recordRetentionFlowView.mockReset();
    mockGlean.recordRetentionFlowEngage.mockReset();
    mockGlean.recordRetentionFlowSubmit.mockReset();
    mockGlean.recordRetentionFlowResult.mockReset();
    mockGetNextChargeChurnContent.mockReturnValue({
      l10nId: 'mock-next-charge-id',
      l10nVars: { amount: '$9.99' },
    });
  });

  describe('Offer state (eligible, cancelAtPeriodEnd, active)', () => {
    it('renders the modal heading from CMS', () => {
      render(<ChurnStaySubscribed {...baseProps} />);

      expect(
        screen.getByRole('heading', { name: /Wait! Save 20%/i })
      ).toBeInTheDocument();
    });

    it('renders modal message lines', () => {
      render(<ChurnStaySubscribed {...baseProps} />);

      expect(
        screen.getByText(/Keep your subscription and save/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Limited time offer/i)).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      render(<ChurnStaySubscribed {...baseProps} />);

      expect(
        screen.getByRole('button', { name: /Stay subscribed and save/i })
      ).toBeInTheDocument();
    });

    it('renders the No thanks link', () => {
      render(<ChurnStaySubscribed {...baseProps} />);

      expect(
        screen.getByRole('link', { name: /Back to Subscriptions page/i })
      ).toBeInTheDocument();
    });

    it('renders the terms link', () => {
      render(<ChurnStaySubscribed {...baseProps} />);

      expect(
        screen.getByText(/Limited terms and restrictions apply/i)
      ).toBeInTheDocument();
    });
  });

  describe('Redeem coupon flow', () => {
    it('shows success view after successful coupon redemption', async () => {
      const user = userEvent.setup();
      mockRedeemChurnCouponAction.mockResolvedValue({ redeemed: true });

      render(<ChurnStaySubscribed {...baseProps} />);

      await user.click(
        screen.getByRole('button', { name: /Stay subscribed and save/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Subscription renewed/i })
        ).toBeInTheDocument();
      });
    });

    it('shows error alert when coupon redemption fails', async () => {
      const user = userEvent.setup();
      mockRedeemChurnCouponAction.mockResolvedValue({
        redeemed: false,
        reason: 'coupon_expired',
      });

      render(<ChurnStaySubscribed {...baseProps} />);

      await user.click(
        screen.getByRole('button', { name: /Stay subscribed and save/i })
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('shows error alert when coupon redemption throws', async () => {
      const user = userEvent.setup();
      mockRedeemChurnCouponAction.mockRejectedValue(new Error('Network error'));

      render(<ChurnStaySubscribed {...baseProps} />);

      await user.click(
        screen.getByRole('button', { name: /Stay subscribed and save/i })
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Success state', () => {
    it('renders "Subscription renewed" heading and product link', async () => {
      const user = userEvent.setup();
      mockRedeemChurnCouponAction.mockResolvedValue({ redeemed: true });

      render(<ChurnStaySubscribed {...baseProps} />);

      await user.click(
        screen.getByRole('button', { name: /Stay subscribed and save/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Subscription renewed/i })
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('link', { name: /Go to Mozilla VPN/i })
      ).toHaveAttribute('href', 'https://vpn.mozilla.org');
    });
  });

  describe('Subscription still active state', () => {
    it('renders active subscription heading and links', () => {
      render(
        <ChurnStaySubscribed
          {...baseProps}
          reason="subscription_still_active"
        />
      );

      expect(
        screen.getByRole('heading', {
          name: /Your Mozilla VPN subscription is active/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Go to Mozilla VPN/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Manage subscriptions/i })
      ).toBeInTheDocument();
    });
  });

  describe('Offer expired state (default fallthrough)', () => {
    it('renders "This offer has expired" heading', () => {
      render(
        <ChurnStaySubscribed
          {...baseProps}
          reason="no_churn_intervention_found"
        />
      );

      expect(
        screen.getByRole('heading', { name: /This offer has expired/i })
      ).toBeInTheDocument();
    });

    it('renders "Stay subscribed" button for resubscribe', () => {
      render(
        <ChurnStaySubscribed
          {...baseProps}
          reason="no_churn_intervention_found"
        />
      );

      expect(
        screen.getByRole('button', { name: /Stay subscribed/i })
      ).toBeInTheDocument();
    });

    it('shows error alert when resubscribe fails', async () => {
      const user = userEvent.setup();
      mockResubscribeSubscriptionAction.mockResolvedValue({ ok: false });

      render(
        <ChurnStaySubscribed
          {...baseProps}
          reason="no_churn_intervention_found"
        />
      );

      await user.click(
        screen.getByRole('button', { name: /Stay subscribed/i })
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('shows success view after successful resubscribe', async () => {
      const user = userEvent.setup();
      mockResubscribeSubscriptionAction.mockResolvedValue({ ok: true });

      render(
        <ChurnStaySubscribed
          {...baseProps}
          reason="no_churn_intervention_found"
        />
      );

      await user.click(
        screen.getByRole('button', { name: /Stay subscribed/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Subscription renewed/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Glean metrics', () => {
    it('records retention flow view on mount for eligible state', () => {
      render(<ChurnStaySubscribed {...baseProps} />);

      expect(mockGlean.recordRetentionFlowView).toHaveBeenCalledWith(
        expect.objectContaining({
          flowType: 'stay',
          eligibilityStatus: 'stay',
          offeringId: 'vpn',
          interval: 'monthly',
        })
      );
    });

    it('does not record view when reason is not eligible', () => {
      render(
        <ChurnStaySubscribed
          {...baseProps}
          reason="subscription_still_active"
        />
      );

      expect(mockGlean.recordRetentionFlowView).not.toHaveBeenCalled();
    });

    it('records engage with remain_canceled action when No thanks is clicked', async () => {
      const user = userEvent.setup();
      render(<ChurnStaySubscribed {...baseProps} />);

      const noThanksLink = screen.getByRole('link', {
        name: /Back to Subscriptions page/i,
      });
      await user.click(noThanksLink);

      expect(mockGlean.recordRetentionFlowEngage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'remain_canceled',
        })
      );
    });
  });
});
