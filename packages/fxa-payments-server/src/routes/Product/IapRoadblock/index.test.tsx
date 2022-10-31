import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MockApp, MOCK_CUSTOMER } from '../../../lib/test-utils';
import { PLAN, SELECTED_PLAN, PROFILE } from '../../../lib/mock-data';
import { SignInLayout } from '../../../components/AppLayout';
import IapRoadblock, { IapRoadblockProps } from './index';
import {
  IapSubscription,
  MozillaSubscriptionTypes,
} from 'fxa-shared/subscriptions/types';
import { Customer } from '../../../store/types';

const subscription: IapSubscription = {
  _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  product_id: SELECTED_PLAN.product_id,
  product_name: 'Better Upgrade Product',
  price_id: 'plan_123',
  auto_renewing: true,
  expiry_time_millis: Date.now(),
  package_name: 'mozilla.cooking.with.foxkeh.monthly',
  sku: 'mozilla.foxkeh',
};
const MOCK_PROPS: IapRoadblockProps = {
  profile: PROFILE,
  currentPlan: PLAN,
  selectedPlan: SELECTED_PLAN,
  isMobile: false,
  subscription,
  customer: MOCK_CUSTOMER as Customer,
  code: 'iap_already_subscribed',
};

describe('routes/Product/IapRoadblock', () => {
  it('renders as expected', async () => {
    const subject = () => {
      return render(
        <MockApp>
          <SignInLayout>
            <IapRoadblock {...MOCK_PROPS} />
          </SignInLayout>
        </MockApp>
      );
    };

    const { findByTestId } = subject();
    const titleEl = await findByTestId('subscription-iapsubscribed-title');
    expect(titleEl).toBeInTheDocument();
    const errorEl = await findByTestId('payment-error');
    expect(errorEl).toBeInTheDocument();
    const actionButton = await findByTestId('manage-subscription-link');
    expect(actionButton).toBeInTheDocument();
    const detailsEl = await findByTestId('plan-details-component');
    expect(detailsEl).toBeInTheDocument();
  });

  it('displays messaging to contact support for help in upgrading', async () => {
    const subject = () => {
      return render(
        <MockApp>
          <SignInLayout>
            <IapRoadblock
              {...{ ...MOCK_PROPS, code: 'iap_upgrade_contact_support' }}
            />
          </SignInLayout>
        </MockApp>
      );
    };

    const { findByTestId } = subject();
    const titleEl = await findByTestId('subscription-iaperrorupgrade-title');
    expect(titleEl).toBeInTheDocument();
    const errorEl = await findByTestId('payment-error');
    expect(errorEl).toBeInTheDocument();
    const actionButton = await findByTestId('iap-upgrade-get-help-button');
    expect(actionButton).toBeInTheDocument();
    const detailsEl = await findByTestId('plan-details-component');
    expect(detailsEl).toBeInTheDocument();
  });
});
