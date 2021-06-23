import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MockApp } from '../../../lib/test-utils';
import { SELECTED_PLAN, PROFILE } from '../../../lib/mock-data';
import { SignInLayout } from '../../../components/AppLayout';
import SubscriptionChangeRoadblock, {
  SubscriptionDowngradeRoadblockProps,
} from './index';

const MOCK_PROPS: SubscriptionDowngradeRoadblockProps = {
  profile: PROFILE,
  selectedPlan: SELECTED_PLAN,
  isMobile: false,
};

const Subject = () => {
  return (
    <MockApp>
      <SignInLayout>
        <SubscriptionChangeRoadblock {...MOCK_PROPS} />
      </SignInLayout>
    </MockApp>
  );
};

describe('routes/Product/SubscriptionDowngradeRoadblock', () => {
  it('renders as expected', async () => {
    const { findByTestId } = render(<Subject />);
    const titleEl = await findByTestId('subscription-noplanchange-title');
    expect(titleEl).toBeInTheDocument();
    const errorEl = await findByTestId('payment-error');
    expect(errorEl).toBeInTheDocument();
    const detailsEl = await findByTestId('plan-details-component');
    expect(detailsEl).toBeInTheDocument();
  });
});
