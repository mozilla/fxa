import { PlanInterval } from 'fxa-shared/subscriptions/types';
import { GenericTermItem } from '../components/TermsAndConditions';

export const priceDetailsProps = {
  priceInfo: {
    id: '123',
    name: 'Monthly Plan',
    productName: 'Mozilla VPN',
    listPrice: 500,
    taxAmount: 50,
    discountAmount: 50,
    totalPrice: 500,
    currency: 'USD',
    interval: 'month' as PlanInterval,
    intervalCount: 1,
    details: [
      'Device-level encryption',
      'Servers in 30+ countries',
      'Connect 5 devices with one subscription',
      'Available for Windows, iOS and Android',
    ],
    subtitle: 'Da best VPN',
  },
  additionalStyles: {
    webIcon:
      'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-web-64.svg',
  },
  infoBox: {
    message: 'Coupon has been applied',
  },
};

export const terms: GenericTermItem[] = [
  {
    key: 'payment-provider-terms',
    title: 'Mozilla uses Stripe and PayPal for secure payment processing.',
    titleLocalizationId: 'title-1',
    items: [
      {
        href: 'https://stripe.com/privacy',
        text: 'Stripe privacy policy',
        localizationId: 'stripe-item-1',
      },
      {
        href: 'https://www.paypal.com/webapps/mpp/ua/privacy-full',
        text: 'PayPal privacy policy',
        localizationId: 'paypal-item-1',
      },
    ],
  },
  {
    key: 'fxa-terms',
    title: 'Firefox Accounts',
    titleLocalizationId: 'title-1',
    items: [
      {
        href: 'https://accounts.stage.mozaws.net/legal/terms',
        text: 'Terms of Service',
        localizationId: 'terms-item-1',
      },
      {
        href: 'https://accounts.stage.mozaws.net/legal/privacy',
        text: 'Privacy Notice',
        localizationId: 'privacy-item-1',
      },
    ],
  },
  {
    key: 'product-terms',
    title: 'Mozilla VPN',
    titleLocalizationId: 'title-1',
    items: [
      {
        href: 'https://www.mozilla.org/about/legal/terms/subscription-services',
        text: 'Terms of Service',
        localizationId: 'terms-item-1',
      },
      {
        href: 'https://www.mozilla.org/privacy/subscription-services',
        text: 'Privacy Notice',
        localizationId: 'privacy-item-1',
      },
      {
        href: 'https://payments-stage.fxa.nonprod.cloudops.mozgcp.net/legal-docs?url=https://accounts-static.cdn.mozilla.net/legal/subscription_services_tos',
        text: 'Download Terms',
        localizationId: 'download-item-1',
      },
    ],
  },
];

type PlanStyles = {
  webIconBackground: string;
};

export type Plan = {
  id: string;
  productName: string;
  planName: string;
  active: Boolean;
  styles?: PlanStyles;
  description: string[];
  subtitle: string;
  upgradeCTA: string;

  successActionButtonUrl: string;
  successActionButtonLabel: string;
  webIconUrl: string;
  tosUrl: string;
  tosDownloadUrl: string;
  privacyNoticeUrl: string;
  privacyNoticeDownloadUrl: string;
  cancellationSurveyUrl: string;
};

export async function mockHCMSFetch(): Promise<Plan> {
  return {
    id: '123',
    productName: 'Testing Foxkeh',
    planName: 'Test',
    active: true,
    styles: {
      webIconBackground: '#20123a',
    },
    description: ['Testing Foxkeh', 'Product Detail line 2'],
    subtitle: 'Test Plan Subtitle',
    upgradeCTA: 'Lets get you updated',
    successActionButtonUrl: 'https://foxkeh.com/buttons/',
    successActionButtonLabel: 'You did it!',
    webIconUrl: 'https://foxkeh.com/downloads/parts/head01.svg',
    tosUrl: 'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
    tosDownloadUrl:
      'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
    privacyNoticeUrl:
      'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
    privacyNoticeDownloadUrl:
      'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
    cancellationSurveyUrl:
      'https://accounts-static.cdn.mozilla.net/legal/mozilla_cancellation_survey_url',
  };
}

type InvoiceTax = {
  amount: number;
  inclusive: boolean;
  displayName: string;
};

type InvoiceDiscount = {
  amount: number;
  amountOff: number;
  percentOff: number | null;
};

export type InvoicePreview = {
  total: number;
  totalExcludingTax: number | null;
  subtotal: number;
  subtotalExcludingTax: number | null;
  currency: string;
  tax: InvoiceTax[] | null;
  discount: InvoiceDiscount[] | null;
};

export const mockInvoicePreview: InvoicePreview = {
  total: 2250,
  totalExcludingTax: 1950,
  subtotal: 2000,
  subtotalExcludingTax: 2000,
  currency: 'USD',
  tax: [
    {
      amount: 300,
      inclusive: false,
      displayName: 'Sales Tax',
    },
  ],
  discount: [
    {
      amount: 50,
      amountOff: 50,
      percentOff: null,
    },
  ],
};

export async function mockInvoicePreviewFetch(
  withDelay: boolean = false
): Promise<InvoicePreview> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockInvoicePreview;
}
