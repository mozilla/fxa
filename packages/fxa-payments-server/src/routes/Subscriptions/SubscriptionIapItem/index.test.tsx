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
  'plan' | 'customerSubscription'
>;

const Subject = ({
  plan = SELECTED_PLAN,
  customerSubscription = googleSubscription,
}: SubjectProps) => {
  return (
    <MockApp>
      <SignInLayout>
        <SubscriptionIapItem
          {...{
            plan,
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
    expect(manageButton).toBeNull();
  });
  it('displays an error dialog if no plan is found', async () => {
    const { findByTestId } = render(<Subject plan={null} />);
    const planErrorEle = await findByTestId('error-subhub-missing-plan');
    expect(planErrorEle).toBeInTheDocument();
  });
});
