/**
 *
 * Temporary File
 *
 * This is a temporary file holding stub async calls
 *
 * Currently this file stubs the following queries
 * - Cart Data fetch
 * - Contentful data fetch by offering
 *
 */
import { CartState } from '@fxa/shared/db/mysql/account';

export async function fetchFromContentful() {
  return {
    offering: {
      stripeProductId: '',
      countries: [],
      defaultPurchase: {
        details: [
          'Device-level encryption',
          'Servers in 30+ countries',
          'Connect 5 devices with one subscription',
          'Available for Windows, iOS and Android',
        ],
        productName: '123Done Pro',
        subtitle: 'The best',
        webIcon:
          'https://accounts-static.cdn.mozilla.net/product-icons/123-done-pro.svg',
      },
      commonContent: {
        cancellationUrl: '',
        emailIcon:
          'https://accounts-static.cdn.mozilla.net/product-icons/123-done-pro-email.png',
        privacyNoticeDownloadUrl:
          'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_privacy_notice',
        privacyNoticeUrl: 'https://www.mozilla.org/privacy/mozilla-vpn/',
        successActionButtonLabel: 'Do somethin',
        successActionButtonUrl: 'https://123done-stage.dev.lcip.org/',
        termsOfServiceDownloadUrl:
          'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
        termsOfServiceUrl:
          'https://www.mozilla.org/about/legal/terms/mozilla-vpn',
      },
    },
  };
}

export async function fetchCartData(cartId: string) {
  return {
    id: '',
    state: CartState.START,
    offeringConfigId: '123done',
    interval: 'monthly',
    nextInvoice: {
      currency: 'usd',
      listAmount: 500,
      totalAmount: 525,
      taxAmounts: [
        {
          inclusive: false,
          title: 'tax',
          amount: 25,
        },
      ],
      discountAmount: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    amount: 525,
  };
}
