import '@testing-library/jest-dom/extend-expect';

import { IapSubscription } from 'fxa-shared/subscriptions/types';

import { SignInLayout } from '../../../components/AppLayout';
import {
  IAP_APPLE_SUBSCRIPTION,
  IAP_GOOGLE_SUBSCRIPTION,
  SELECTED_PLAN,
} from '../../../lib/mock-data';
import {
  deepCopy,
  MockApp,
  renderWithLocalizationProvider,
} from '../../../lib/test-utils';
import { PickPartial } from '../../../lib/types';
import SubscriptionIapItem, {
  SubscriptionIapItemProps,
} from './SubscriptionIapItem';

type SubjectProps = PickPartial<
  SubscriptionIapItemProps,
  'productName' | 'customerSubscription'
>;

const Subject = ({
  productName = SELECTED_PLAN.product_name,
  customerSubscription = IAP_GOOGLE_SUBSCRIPTION,
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
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
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
    const { findByTestId } = renderWithLocalizationProvider(
      <Subject
        customerSubscription={
          {
            ...IAP_GOOGLE_SUBSCRIPTION,
            auto_renewing: false,
          } as IapSubscription
        }
      />
    );
    const subscriptionItemEle = await findByTestId('subscription-item');
    expect(subscriptionItemEle).toBeInTheDocument();
    const iapDetailsEle = await findByTestId('iap-details');
    expect(iapDetailsEle).toHaveTextContent('Expires on');
  });
  it('renders as expected for an App Store subscription', async () => {
    const { findByTestId, queryByTestId } = renderWithLocalizationProvider(
      <Subject
        customerSubscription={IAP_APPLE_SUBSCRIPTION as IapSubscription}
      />
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
    const subscription = deepCopy(IAP_APPLE_SUBSCRIPTION);

    const { findByTestId } = renderWithLocalizationProvider(
      <Subject customerSubscription={subscription as IapSubscription} />
    );
    const subscriptionItemEle = await findByTestId('subscription-item');
    expect(subscriptionItemEle).toBeInTheDocument();
    const iapDetailsEle = await findByTestId('iap-details');
    expect(iapDetailsEle).toBeInTheDocument();
    expect(iapDetailsEle).not.toHaveTextContent('Expires');
    expect(iapDetailsEle).not.toHaveTextContent('Next');
  });

  it('renders an App store subscription with expiration data and auto renew', async () => {
    const subscription = deepCopy(IAP_APPLE_SUBSCRIPTION);
    subscription.expiry_time_millis = 1656759852811;
    subscription.auto_renewing = true;

    const { findByTestId } = renderWithLocalizationProvider(
      <Subject customerSubscription={subscription as IapSubscription} />
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
    const subscription = deepCopy(IAP_APPLE_SUBSCRIPTION);
    subscription.expiry_time_millis = 1656759852811;
    subscription.auto_renewing = false;

    const { findByTestId } = renderWithLocalizationProvider(
      <Subject customerSubscription={subscription as IapSubscription} />
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
