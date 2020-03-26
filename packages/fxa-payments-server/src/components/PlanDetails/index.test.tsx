import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import PlanDetails from './index';

const userProfile = {
  avatar: './avatar.svg',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
};

const selectedPlan = {
  plan_id: 'planId',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'mos',
};

afterEach(cleanup);

describe('PlanDetails', () => {
  it('renders as expected', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{ profile: userProfile, showExpandButton: true, selectedPlan }}
        />
      );
    };

    const { queryByTestId } = subject();
    const productLogo = queryByTestId('product-logo');
    expect(productLogo).toHaveAttribute('alt', selectedPlan.product_name);

    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();

    expect(queryByTestId('list')).not.toBeTruthy();
  });

  it('hides expand button when showExpandButton is false', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{ profile: userProfile, showExpandButton: false, selectedPlan }}
        />
      );
    };

    const { queryByTestId } = subject();

    const list = queryByTestId('list');
    expect(list).toBeVisible();

    expect(queryByTestId('footer')).not.toBeTruthy();
  });

  it('shows and hides detail section when expand button is clicked', () => {
    const subject = () => {
      return render(
        <PlanDetails
          {...{ profile: userProfile, showExpandButton: true, selectedPlan }}
        />
      );
    };

    const { getByTestId, queryByTestId } = subject();

    fireEvent.click(getByTestId('button'));

    expect(queryByTestId('list')).toBeVisible();

    fireEvent.click(getByTestId('button'));

    expect(queryByTestId('list')).not.toBeTruthy();

  });
});
