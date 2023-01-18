import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PaymentConfirmation, {
  PaymentConfirmationInvoiceInfo,
  PaymentConfirmationProps,
} from '../../../../components/PaymentConfirmation';
import PriceDetails, { PriceInfo } from '../../../../components/PriceDetails';
import SubscriptionTitle from '../../../../components/SubscriptionTitle';
import TermsAndConditions from '../../../../components/TermsAndConditions';
import {
  mockHCMSFetch,
  mockInvoicePreviewFetch,
  Plan,
  priceDetailsProps,
} from '../../../../data/mock';
import {
  buildAdditionalStyles,
  buildPriceDetails,
  buildTermsPropsFromPriceConfig,
} from '../../../../lib/checkout/helpers';

const mockInvoiceInfo: PaymentConfirmationInvoiceInfo = {
  number: 'INV-003294',
  date: Date.now(),
  total: 500,
  interval: 'month',
  intervalCount: 1,
  currency: 'USD',
};

const mockData: PaymentConfirmationProps = {
  accountExists: true,
  email: 'test@example.com',
  productName: '',
  downloadUrl: '',
  invoiceInfo: mockInvoiceInfo,
  paymentProvider: 'stripe',
  brand: 'visa',
  last4: '4242',
};

// For testing
const LOCALE = 'en';

// Generates `/checkout/123` (is the ID set in priceDetailsprops in data/mock)
export async function getStaticPaths() {
  // Add logic to dynamically fetch IDs from hCMS (or for the prototype the mock GraphQL)
  return {
    paths: [{ params: { priceId: priceDetailsProps.priceInfo.id } }],
    fallback: false, // can also be true or 'blocking'
  };
}

export async function getStaticProps({ params }: { params: any }) {
  // Add logic here for translations
  // https://soykje.gitlab.io/en/blog/nextjs-i18n/

  // Fetch price config from the hCMS. (Currently mocked out, returning static data)
  const hCmsPriceConfig = await mockHCMSFetch(params.priceId, LOCALE);
  return {
    // Passed to the page component as props
    props: { priceConfig: hCmsPriceConfig },
  };
}

export default function CheckoutSuccessPage({
  priceConfig,
}: {
  priceConfig: Plan;
}) {
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  console.log(router.query);

  // Investigate how to only execute this once
  const terms = buildTermsPropsFromPriceConfig(priceConfig);
  const additionalStyles = buildAdditionalStyles(priceConfig);

  // Once we switch to GraphQL also switch to Vercel SWR
  // https://nextjs.org/docs/basic-features/data-fetching/client-side#client-side-data-fetching-with-swr
  useEffect(() => {
    setLoading(true);
    mockInvoicePreviewFetch().then((res) => {
      const compiledPriceInfo = buildPriceDetails(priceConfig, res);
      setPriceInfo(compiledPriceInfo);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <SubscriptionTitle screenType="success" />
      <article className="component-card border-t-0 min-h-full mb-6 pt-4 px-4 pb-14 rounded-t-lg text-grey-600 tablet:rounded-t-none desktop:px-12 desktop:pb-12">
        <PaymentConfirmation {...mockData} />
        <TermsAndConditions terms={terms} />
      </article>
      <aside className="payment-panel">
        {isLoading || !priceInfo ? (
          <div>Loading</div>
        ) : (
          <PriceDetails
            priceInfo={priceInfo}
            additionalStyles={additionalStyles}
          />
        )}
        {/*Commenting out for now, and will add in later*/}
        {/* <CouponForm />*/}
      </aside>
    </>
  );
}
