import GenericTerms, { GenericTermsListItem } from './GenericTerms';

// paymentProviderItems, accountsItems and vpnItems could eventually be populated from the hCMS

const paymentProviderItems: GenericTermsListItem[] = [
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
];

const accountsItems: GenericTermsListItem[] = [
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
];

const vpnItems: GenericTermsListItem[] = [
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
];

export default function TermsAndConditions() {
  return (
    <>
      <h1>Ts and Cs</h1>
      <GenericTerms
        title="Mozilla uses Stripe and PayPal for secure payment processing."
        titleLocalizationId="title-1"
        items={paymentProviderItems}
      />
      <GenericTerms
        title="Firefox Accounts"
        titleLocalizationId="title-1"
        items={accountsItems}
      />
      <GenericTerms
        title="Mozilla VPN"
        titleLocalizationId="title-1"
        items={vpnItems}
      />
    </>
  );
}
