import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MockApp } from '../../../lib/test-utils';
import { SELECTED_PLAN } from '../../../lib/mock-data';
import { SignInLayout } from '../../../components/AppLayout';

import {
  AppleSubscription,
  GooglePlaySubscription,
  IapSubscription,
  MozillaSubscriptionTypes,
} from 'fxa-shared/subscriptions/types';

import SubscriptionIapItem, {
  SubscriptionIapItemProps,
} from './SubscriptionIapItem';
import { PickPartial } from '../../../lib/types';

const deepCopy = (object: Object) => JSON.parse(JSON.stringify(object));

const appleSubscription: IapSubscription = {
  _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
  product_id: SELECTED_PLAN.product_id,
};

const googleSubscription: IapSubscription = {
  _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  product_id: SELECTED_PLAN.product_id,
  auto_renewing: true,
  expiry_time_millis: Date.now(),
  package_name: 'mozilla.cooking.with.foxkeh.monthly',
  sku: 'mozilla.foxkeh',
};

type SubjectProps = PickPartial<
  SubscriptionIapItemProps,
  'productName' | 'customerSubscription'
>;

const Subject = ({
  productName = SELECTED_PLAN.product_name,
  customerSubscription = googleSubscription,
}: SubjectProps) => {
  return (
    <MockApp>
      <SignInLayout>
        <SubscriptionIapItem
          {...{
            productName,
            customerSubscription,
          }}
        />
      </SignInLayout>
    </MockApp>
  );
};

describe('routes/Subscriptions/SubscriptionIapItem', () => {
  it('renders as expected for a Google Play subscription with autorenew=true', async () => {
    const { findByTestId } = render(<Subject />);
    const subscriptionItemEle = await findByTestId('subscription-item');
    expect(subscriptionItemEle).toBeInTheDocument();
    const iapDetailsEle = await findByTestId('iap-details');
    expect(iapDetailsEle).toBeInTheDocument();
    expect(iapDetailsEle).toHaveTextContent('Google');
    expect(iapDetailsEle).toHaveTextContent('Next billed on');
    const manageButton = await findByTestId('manage-iap-subscription-button');
    expect(manageButton).toBeInTheDocument();
  });
  it('renders as expected for a Google Play subscription with autorenew=false', async () => {
    const { findByTestId } = render(
      <Subject
        customerSubscription={
          {
            ...googleSubscription,
            auto_renewing: false,
          } as GooglePlaySubscription
        }
      />
    );
    const subscriptionItemEle = await findByTestId('subscription-item');
    expect(subscriptionItemEle).toBeInTheDocument();
    const iapDetailsEle = await findByTestId('iap-details');
    expect(iapDetailsEle).toHaveTextContent('Expires on');
  });
  it('renders as expected for an App Store subscription', async () => {
    const { findByTestId, queryByTestId } = render(
      <Subject customerSubscription={appleSubscription as AppleSubscription} />
    );
    const subscriptionItemEle = await findByTestId('subscription-item');
    expect(subscriptionItemEle).toBeInTheDocument();
    const iapDetailsEle = await findByTestId('iap-details');
    expect(iapDetailsEle).toBeInTheDocument();
    expect(iapDetailsEle).toHaveTextContent('Apple');
    const manageButton = queryByTestId('manage-iap-subscription-button');
    expect(manageButton).toBeInTheDocument();
  });

  it('renders an App store subscription with no expiration data', async () => {
    const subscription = deepCopy(appleSubscription);

    const { findByTestId } = render(
      <Subject customerSubscription={subscription as AppleSubscription} />
    );
    const subscriptionItemEle = await findByTestId('subscription-item');
    expect(subscriptionItemEle).toBeInTheDocument();
    const iapDetailsEle = await findByTestId('iap-details');
    expect(iapDetailsEle).toBeInTheDocument();
    expect(iapDetailsEle).not.toHaveTextContent('Expires');
    expect(iapDetailsEle).not.toHaveTextContent('Next');
  });

  it('renders an App store subscription with expiration data and auto renew', async () => {
    const subscription = deepCopy(appleSubscription);
    subscription.expiry_time_millis = 1656759852811;
    subscription.auto_renewing = true;

    const { findByTestId } = render(
      <Subject customerSubscription={subscription as AppleSubscription} />
    );
    const subscriptionItemEle = await findByTestId('subscription-item');
    expect(subscriptionItemEle).toBeInTheDocument();
    const iapDetailsEle = await findByTestId('iap-details');
    expect(iapDetailsEle).toBeInTheDocument();
    expect(iapDetailsEle).not.toHaveTextContent('Expires');
    expect(iapDetailsEle).toHaveTextContent('Next');
    expect(iapDetailsEle).toHaveTextContent('07/02/2022');
  });

  it('renders an App store subscription with expiration data and no auto renew', async () => {
    const subscription = deepCopy(appleSubscription);
    subscription.expiry_time_millis = 1656759852811;
    subscription.auto_renewing = false;

    const { findByTestId } = render(
      <Subject customerSubscription={subscription as AppleSubscription} />
    );
    const subscriptionItemEle = await findByTestId('subscription-item');
    expect(subscriptionItemEle).toBeInTheDocument();
    const iapDetailsEle = await findByTestId('iap-details');
    expect(iapDetailsEle).toBeInTheDocument();
    expect(iapDetailsEle).toHaveTextContent('Expires');
    expect(iapDetailsEle).not.toHaveTextContent('Next');
    expect(iapDetailsEle).toHaveTextContent('07/02/2022');
  });
});
