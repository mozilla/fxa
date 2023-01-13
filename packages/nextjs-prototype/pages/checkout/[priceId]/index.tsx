import { useState } from 'react';
import SubscriptionTitle from '../../../components/SubscriptionTitle';
import PriceDetails from '../../../components/PriceDetails';
import AccountsInfo from '../../../components/AccountsInfo';
import TermsAndConditions from '../../../components/TermsAndConditions';
import PaymentForm from '../../../components/PaymentForm';
import { mockHCMSFetch, Plan, priceDetailsProps } from '../../../data/mock';
import { buildTermsPropsFromPriceConfig } from './helpers';

// Generates `/checkout/123` (is the ID set in priceDetailsprops in data/mock)
export async function getStaticPaths() {
  // Add logic to dynamically fetch IDs from hCMS (or for the prototype the mock GraphQL)
  return {
    paths: [{ params: { priceId: priceDetailsProps.priceInfo.id } }],
    fallback: false, // can also be true or 'blocking'
  };
}

export async function getStaticProps() {
  // Fetch price config from the hCMS. (Currently mocked out, returning static data)
  const hCmsPriceConfig = await mockHCMSFetch();
  return {
    // Passed to the page component as props
    props: { priceConfig: hCmsPriceConfig },
  };
}

export default function CheckoutPricePage({
  priceConfig,
}: {
  priceConfig: Plan;
}) {
  const [paymentsDisabled, setPaymentsDisabled] = useState(true);

  // Investigate how to only execute this once
  const terms = buildTermsPropsFromPriceConfig(priceConfig);

  return (
    <div className="main-content">
      <SubscriptionTitle screenType="create" />
      <div className="payment-panel">
        <PriceDetails
          priceInfo={priceDetailsProps.priceInfo}
          additionalStyles={priceDetailsProps.additionalStyles}
          infoBox={priceDetailsProps.infoBox}
        />
      </div>
      <div className="component-card border-t-0 min-h-full mb-6 pt-4 px-4 pb-14 rounded-t-lg text-grey-600 tablet:rounded-t-none desktop:px-12 desktop:pb-12">
        <AccountsInfo signInUrl="" setPaymentsDisabled={setPaymentsDisabled} />
        <PaymentForm disabled={paymentsDisabled} />
        <TermsAndConditions terms={terms} />
      </div>
    </div>
  );
}
