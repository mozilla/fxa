/* eslint-disable-next-line */
export type GenericTermsListItem = {
  key: string;
  href: string;
  text: string;
  localizationId: string;
};

export type GenericTermItem = {
  key: string;
  title: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
};

const PaymentProviders = {
  stripe: 'stripe',
  paypal: 'paypal',
  none: 'not_chosen',
} as const;

type PaymentProvidersType = typeof PaymentProviders;
type PaymentProvider = PaymentProvidersType[keyof PaymentProvidersType];

type GenericTermsProps = {
  key: string;
  title: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
};

function buildPaymentTerms(provider?: PaymentProvider): GenericTermItem[] {
  let providerString = '';
  const items: GenericTermsListItem[] = [];

  if (
    provider === PaymentProviders.stripe ||
    provider === PaymentProviders.none
  ) {
    providerString = 'Stripe';
    items.push({
      key: 'payment-provider-terms-1',
      href: 'https://stripe.com/privacy',
      text: 'Stripe privacy policy',
      localizationId: 'stripe-item-1',
    });
  }

  if (
    provider === PaymentProviders.paypal ||
    provider === PaymentProviders.none
  ) {
    providerString = !providerString
      ? 'PayPal'
      : `${providerString} and PayPal`;
    items.push({
      key: 'payment-provider-terms-2',
      href: 'https://www.paypal.com/webapps/mpp/ua/privacy-full',
      text: 'PayPal privacy policy',
      localizationId: 'paypal-item-1',
    });
  }

  if (!items.length) {
    return [];
  }

  return [
    {
      key: 'payment-provider-terms',
      title: `Mozilla uses ${providerString} for secure payment processing.`,
      titleLocalizationId: 'title-1',
      items,
    },
  ];
}

function buildFirefoxAccountsTerms(
  showFxaLinks: boolean,
  contentServerURL?: string
): GenericTermItem[] {
  if (!showFxaLinks) {
    return [];
  }

  return [
    {
      key: 'fxa-terms',
      title: 'Firefox Accounts',
      titleLocalizationId: 'title-1',
      items: [
        {
          key: 'fxa-terms-1',
          href: `${contentServerURL}/legal/terms`,
          text: 'Terms of Service',
          localizationId: 'terms-item-1',
        },
        {
          key: 'fxa-terms-2',
          href: `${contentServerURL}/legal/privacy`,
          text: 'Privacy Notice',
          localizationId: 'privacy-item-1',
        },
      ],
    },
  ];
}

function buildProductTerms(
  productName: string,
  termsOfService?: string,
  privacyNotice?: string,
  termsOfServiceDownload?: string
): GenericTermItem[] {
  const items: GenericTermsListItem[] = [];

  if (termsOfService) {
    items.push({
      key: 'product-terms-1',
      href: termsOfService,
      text: 'Terms of Service',
      localizationId: 'terms-item-1',
    });
  }

  if (privacyNotice) {
    items.push({
      key: 'product-terms-2',
      href: privacyNotice,
      text: 'Privacy Notice',
      localizationId: 'privacy-item-1',
    });
  }

  if (termsOfServiceDownload) {
    items.push({
      key: 'product-terms-3',
      href: termsOfServiceDownload,
      text: 'Download Terms',
      localizationId: 'download-item-1',
    });
  }

  if (!items.length) {
    return [];
  }

  return [
    {
      key: 'product-terms',
      title: productName,
      titleLocalizationId: 'title-1',
      items,
    },
  ];
}

function GenericTerms(props: GenericTermsProps) {
  const { title, titleLocalizationId, items } = props;
  return (
    <div className="clear-both mt-5 text-xs leading-5 text-center">
      <p className="m-0 font-semibold text-grey-500">{title}</p>

      <p className="m-0 text-grey-400">
        {items.map((item) => (
          <span key={`span-${item.key}`} className="mr-3 last:mr-0">
            <a key={`link-${item.key}`} href={item.href} target="_blank">
              {item.text}
              <span className="sr-only">Opens in new window</span>
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}

export interface TermsAndPrivacyProps {
  productName: string;
  termsOfService?: string;
  termsOfServiceDownload?: string;
  privacyNotice?: string;
  paymentProvider?: PaymentProvider;
  showFXALinks?: boolean;
  contentServerURL?: string;
}

export function TermsAndPrivacy({
  productName,
  termsOfService,
  termsOfServiceDownload,
  privacyNotice,
  paymentProvider,
  showFXALinks = false,
  contentServerURL,
}: TermsAndPrivacyProps) {
  const paymentTerms = buildPaymentTerms(paymentProvider);
  const firefoxAccountsTerms = buildFirefoxAccountsTerms(
    showFXALinks,
    contentServerURL
  );
  const productTerms = buildProductTerms(
    productName,
    termsOfService,
    privacyNotice,
    termsOfServiceDownload
  );

  const terms: GenericTermItem[] = [
    ...paymentTerms,
    ...firefoxAccountsTerms,
    ...productTerms,
  ];

  return (
    <>
      {terms.map((term) => (
        // eslint-disable-next-line react/jsx-key
        <GenericTerms {...term} />
      ))}
    </>
  );
}

export default TermsAndPrivacy;
