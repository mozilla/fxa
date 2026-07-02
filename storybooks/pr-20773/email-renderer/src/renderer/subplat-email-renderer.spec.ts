/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NodeRendererBindings } from './bindings-node';
import { SubplatEmailRender } from './subplat-email-renderer';

const mockLinkSupport = 'http://localhost:3030/mock-support-link';
const mockEmail = 'mock-email@mozilla.com';
const mockInvoiceLink = 'https://pay.stripe.com/invoice/acct_123/invst_abc123';

const defaultSubscriptionLayoutValues = {
  email: mockEmail,
  subscriptionTermsUrl: 'http://localhost:3030/subscription-terms',
  subscriptionPrivacyUrl: 'http://localhost:3030/subscription-privacy',
  cancelSubscriptionUrl: 'http://localhost:3030/cancel',
  updateBillingUrl: 'http://localhost:3030/update-billing',
  reactivateSubscriptionUrl: 'http://localhost:3030/reactivate',
  accountSettingsUrl: 'http://localhost:3030/settings',
  cancellationSurveyUrl: 'http://localhost:3030/survey',
  mozillaSupportUrl: mockLinkSupport,
};

const baseInvoiceTemplateValues = {
  productName: 'Mozilla VPN',
  icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  invoiceNumber: 'INV-001',
  invoiceDateOnly: '10/13/2024',
  invoiceLink: mockInvoiceLink,
  invoiceAmountDue: '$9.99',
  invoiceAmountDueInCents: 999,
  invoiceTotal: '$9.99',
  invoiceTotalInCents: 999,
  invoiceSubtotal: undefined as string | undefined,
  invoiceSubtotalInCents: undefined as number | undefined,
  invoiceDiscountAmount: undefined as string | undefined,
  invoiceTaxAmount: undefined as string | undefined,
  invoiceTaxAmountInCents: 0,
  invoiceStartingBalance: undefined as string | undefined,
  discountType: undefined as string | undefined,
  discountDuration: undefined as string | undefined,
  nextInvoiceDateOnly: '11/13/2024',
  productPaymentCycle: 'monthly',
  subscriptionSupportUrl: mockLinkSupport,
  offeringPrice: '$9.99',
  offeringPriceInCents: 999,
  remainingAmountTotalInCents: undefined as number | undefined,
  remainingAmountTotal: undefined as string | undefined,
  unusedAmountTotalInCents: undefined as number | undefined,
  unusedAmountTotal: undefined as string | undefined,
  creditAppliedInCents: undefined as number | undefined,
  creditReceived: '$0.00',
  cardName: 'Visa',
  lastFour: '4242',
  paymentProviderName: undefined as string | undefined,
  manageSubscriptionUrl: 'http://localhost:3030/subscriptions',
  showTaxAmount: false,
};

describe('SubPlat Email Renderer — Invoice emails', () => {
  let renderer: SubplatEmailRender;

  beforeEach(() => {
    renderer = new SubplatEmailRender(new NodeRendererBindings());
  });

  it('renders the invoice link href in the first invoice email', async () => {
    const email = await renderer.renderSubscriptionFirstInvoice(
      baseInvoiceTemplateValues,
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain(mockInvoiceLink);
  });

  it('renders the tax line when showTaxAmount is true in the first invoice email', async () => {
    const email = await renderer.renderSubscriptionFirstInvoice(
      {
        ...baseInvoiceTemplateValues,
        showTaxAmount: true,
        invoiceTaxAmountInCents: 200,
        invoiceTaxAmount: '$2.00',
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('$2.00');
    expect(email.html).toContain('subscription-charges-taxes');
  });

  it('does not render the tax line when showTaxAmount is false', async () => {
    const email = await renderer.renderSubscriptionFirstInvoice(
      {
        ...baseInvoiceTemplateValues,
        showTaxAmount: false,
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).not.toContain('subscription-charges-taxes');
  });

  it('renders the invoice link href in the subsequent invoice email', async () => {
    const email = await renderer.renderSubscriptionSubsequentInvoice(
      baseInvoiceTemplateValues,
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain(mockInvoiceLink);
  });

  it('renders the tax line when showTaxAmount is true in the subsequent invoice email', async () => {
    const email = await renderer.renderSubscriptionSubsequentInvoice(
      {
        ...baseInvoiceTemplateValues,
        showTaxAmount: true,
        invoiceTaxAmountInCents: 200,
        invoiceTaxAmount: '$2.00',
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('$2.00');
    expect(email.html).toContain('subscription-charges-taxes');
  });
});

describe('SubPlat Email Renderer — Lifecycle emails', () => {
  let renderer: SubplatEmailRender;

  beforeEach(() => {
    renderer = new SubplatEmailRender(new NodeRendererBindings());
  });

  it('renderDownloadSubscription renders welcome email', async () => {
    const email = await renderer.renderDownloadSubscription(
      {
        productName: 'Mozilla VPN',
        icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
        link: 'http://localhost:3030/download',
        subscriptionSupportUrl: mockLinkSupport,
        playStoreLink:
          'https://play.google.com/store/apps/details?id=org.mozilla.firefox.vpn',
        appStoreLink: 'https://apps.apple.com/us/app/mozilla-vpn/id1489407738',
        iosUrl: undefined,
        androidUrl: undefined,
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('Mozilla VPN');
    expect(email.html).toContain('http://localhost:3030/download');
  });

  it('renderSubscriptionCancellation renders cancellation email', async () => {
    const email = await renderer.renderSubscriptionCancellation(
      {
        productName: 'Mozilla VPN',
        isCancellationEmail: true,
        invoiceTotal: '$9.99',
        invoiceDateOnly: '10/13/2024',
        serviceLastActiveDateOnly: '11/13/2024',
        showOutstandingBalance: false,
        cancelAtEnd: true,
        isFreeTrialCancellation: false,
        cancellationSurveyUrl: 'http://localhost:3030/survey',
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('Mozilla VPN');
    expect(email.html).toContain('11/13/2024');
  });

  it('renderSubscriptionReactivation renders reactivation email', async () => {
    const email = await renderer.renderSubscriptionReactivation(
      {
        productName: 'Mozilla VPN',
        icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
        invoiceTotal: '$9.99',
        nextInvoiceDateOnly: '11/13/2024',
        subscriptionSupportUrl: mockLinkSupport,
        isFreeTrialReactivation: false,
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('Mozilla VPN');
    expect(email.html).toContain('$9.99');
    expect(email.html).toContain('11/13/2024');
  });

  it('renderSubscriptionPaymentFailed renders failed payment email', async () => {
    const email = await renderer.renderSubscriptionPaymentFailed(
      {
        productName: 'Mozilla VPN',
        icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
        subscriptionSupportUrl: mockLinkSupport,
        updateBillingUrl: 'http://localhost:3030/update-billing',
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('Mozilla VPN');
    expect(email.html).toContain('http://localhost:3030/update-billing');
  });

  it('renderSubscriptionFailedPaymentsCancellation renders cancellation for payment issues', async () => {
    const email = await renderer.renderSubscriptionFailedPaymentsCancellation(
      {
        productName: 'Mozilla VPN',
        isCancellationEmail: true,
        cancellationSurveyUrl: 'http://localhost:3030/survey',
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('Mozilla VPN');
    expect(email.html).toContain('http://localhost:3030/survey');
  });

  it('renderSubscriptionRenewalReminder renders renewal notice email', async () => {
    const email = await renderer.renderSubscriptionRenewalReminder(
      {
        productName: 'Mozilla VPN',
        showTax: false,
        invoiceTotal: '$9.99',
        planInterval: 'monthly',
        reminderLength: '14',
        subscriptionSupportUrl: mockLinkSupport,
        updateBillingUrl: 'http://localhost:3030/update-billing',
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('Mozilla VPN');
    expect(email.html).toContain('http://localhost:3030/update-billing');
  });

  it('renderSubscriptionUpgrade renders upgrade confirmation email', async () => {
    const email = await renderer.renderSubscriptionUpgrade(
      {
        productName: 'Mozilla VPN Plus',
        icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
        productIconURLNew:
          'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-plus-email.png',
        invoiceAmountDue: '$14.99',
        paymentAmountNew: '$14.99',
        paymentAmountOld: '$9.99',
        productNameOld: 'Mozilla VPN',
        productPaymentCycleNew: 'monthly',
        productPaymentCycleOld: 'monthly',
        paymentProrated: '$5.00',
        subscriptionSupportUrl: mockLinkSupport,
        previousRate: {
          message: 'Your previous rate was $9.99 per month.',
        },
        newRate: {
          message: 'Going forward, you will be charged $14.99 per month.',
        },
      },
      defaultSubscriptionLayoutValues
    );

    expect(email).toBeDefined();
    expect(email.html).toContain('Mozilla VPN Plus');
    expect(email.html).toContain('Mozilla VPN');
    expect(email.html).toContain('$14.99');
  });
});
