import React from 'react';
import { useRouter } from 'next/router';
import SubscriptionTitle from '../../../components/SubscriptionTitle';
import PlanDetails from '../../../components/PlanDetails';
import AccountsInfo from '../../../components/AccountsInfo';
import TermsAndConditions from '../../../components/TermsAndConditions';
import PaymentForm from '../../../components/PaymentForm';
import { PlanInterval } from '../../../../fxa-shared/subscriptions/types';

const planDetailsProps = {
  priceInfo: {
    id: 'price_123',
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

export default function CheckoutPricePage() {
  const router = useRouter();
  const priceId = router.query.priceId;
  return (
    <div className="main-content">
      <SubscriptionTitle screenType="create" />
      <div className="payment-panel">
        <PlanDetails
          priceInfo={planDetailsProps.priceInfo}
          additionalStyles={planDetailsProps.additionalStyles}
          infoBox={planDetailsProps.infoBox}
        />
      </div>
      <div className="component-card border-t-0 min-h-full mb-6 pt-4 px-4 pb-14 rounded-t-lg text-grey-600 tablet:rounded-t-none desktop:px-12 desktop:pb-12">
        <AccountsInfo />
        <PaymentForm />
        <TermsAndConditions />
      </div>
    </div>
  );
}
