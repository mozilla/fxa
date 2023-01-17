import { PlanInterval } from 'fxa-shared/subscriptions/types';
import AccountsInfo from '../../components/AccountsInfo';
import PlanDetails from '../../components/PriceDetails';
import CouponForm from '../../components/CouponForm';
import TermsAndConditions from '../../components/TermsAndConditions';
import { useState } from 'react';
import { DEFAULT_TERMS } from '../../lib/checkout/helpers';

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

export default function PlayHome() {
  const [, setPaymentsDisabled] = useState(true);
  return (
    <div className="mx-8">
      <h1>Playground to test or show components</h1>
      <div className="mt-8 w-[600px]">
        <h2>Account Info</h2>
        <AccountsInfo
          signInUrl={''}
          setPaymentsDisabled={setPaymentsDisabled}
        />
      </div>
      <div className="mt-8">
        <h2>Ts & Cs</h2>
        <TermsAndConditions terms={DEFAULT_TERMS} />
      </div>
      <div className="mt-8 w-[400px]">
        <h2>Plan Details</h2>
        <PlanDetails
          priceInfo={planDetailsProps.priceInfo}
          additionalStyles={planDetailsProps.additionalStyles}
          infoBox={planDetailsProps.infoBox}
        />
        <CouponForm />
      </div>
    </div>
  );
}
