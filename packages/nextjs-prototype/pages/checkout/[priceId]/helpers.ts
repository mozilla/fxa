import { GenericTermItem } from '../../../components/TermsAndConditions';
import { Plan } from '../../../data/mock';

const DEFAULT_TERMS: GenericTermItem[] = [
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
];

/**
 * Build the terms and privacy props using DEFAULT_TERMS
 * and the price config from the hCMS for the price specified by the path
 */
export function buildTermsPropsFromPriceConfig(priceConfig: Plan) {
  const terms = [...DEFAULT_TERMS];
  terms.push({
    key: 'product-terms',
    title: priceConfig.productName,
    titleLocalizationId: 'title-1',
    items: [
      {
        href: priceConfig.tosUrl,
        text: 'Terms of Service',
        localizationId: 'terms-item-1',
      },
      {
        href: priceConfig.privacyNoticeUrl,
        text: 'Privacy Notice',
        localizationId: 'privacy-item-1',
      },
      {
        href: priceConfig.tosDownloadUrl,
        text: 'Download Terms',
        localizationId: 'download-item-1',
      },
    ],
  });

  return terms;
}
