import { GenericTermItem, TermsAndPrivacy } from '@fxa/payments-ui/server';

export const terms: GenericTermItem[] = [
  {
    key: 'payment-provider-terms',
    title: 'Mozilla uses Stripe and PayPal for secure payment processing.',
    titleLocalizationId: 'title-1',
    items: [
      {
        key: 'payment-provider-terms-1',
        href: 'https://stripe.com/privacy',
        text: 'Stripe privacy policy',
        localizationId: 'stripe-item-1',
      },
      {
        key: 'payment-provider-terms-2',
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
        key: 'fxa-terms-1',
        href: 'https://accounts.stage.mozaws.net/legal/terms',
        text: 'Terms of Service',
        localizationId: 'terms-item-1',
      },
      {
        key: 'fxa-terms-2',
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
        key: 'product-terms-1',
        href: 'https://www.mozilla.org/about/legal/terms/subscription-services',
        text: 'Terms of Service',
        localizationId: 'terms-item-1',
      },
      {
        key: 'product-terms-2',
        href: 'https://www.mozilla.org/privacy/subscription-services',
        text: 'Privacy Notice',
        localizationId: 'privacy-item-1',
      },
      {
        key: 'product-terms-3',
        href: 'https://payments-stage.fxa.nonprod.cloudops.mozgcp.net/legal-docs?url=https://accounts-static.cdn.mozilla.net/legal/subscription_services_tos',
        text: 'Download Terms',
        localizationId: 'download-item-1',
      },
    ],
  },
];

/* eslint-disable-next-line */
export interface TermsProps {}

export function Terms(props: TermsProps) {
  return (
    <div>
      <h1>Welcome to Terms!</h1>
      <TermsAndPrivacy
        productName="Mozilla VPN"
        termsOfService="https://www.mozilla.org/about/legal/terms/subscription-services"
        termsOfServiceDownload="https://payments-stage.fxa.nonprod.cloudops.mozgcp.net/legal-docs?url=https://accounts-static.cdn.mozilla.net/legal/subscription_services_tos"
        privacyNotice="https://www.mozilla.org/privacy/subscription-services"
        paymentProvider={'not_chosen'}
        showFXALinks={true}
        contentServerURL="https://accounts.stage.mozaws.net"
      />
    </div>
  );
}

export default Terms;
