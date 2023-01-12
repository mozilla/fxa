import { PlanInterval } from 'fxa-shared/subscriptions/types';
import AccountsInfo from '../../components/AccountsInfo';
import PlanDetails from '../../components/PlanDetails';
import TermsAndConditions from '../../components/TermsAndConditions';

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
  return (
    <div className="mx-8">
      <h1>Playground to test or show components</h1>
      <div className="mt-8 w-[600px]">
        <h2>Account Info</h2>
        <AccountsInfo />
      </div>
      <div className="mt-8">
        <h2>Ts & Cs</h2>
        <TermsAndConditions />
      </div>
      <div className="mt-8 w-[400px]">
        <h2>Plan Details</h2>
        <PlanDetails
          priceInfo={planDetailsProps.priceInfo}
          additionalStyles={planDetailsProps.additionalStyles}
          infoBox={planDetailsProps.infoBox}
        />
      </div>
    </div>
  );
}
