/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {
  CouponInfoBoxMessageType,
  useCheckboxState,
  useInfoBoxMessage,
  useNonce,
} from './hooks';
import { COUPON_DETAILS_VALID, SELECTED_PLAN } from './mock-data';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { Plan } from 'fxa-shared/subscriptions/types';

afterEach(cleanup);

describe('useCheckboxStateResult', () => {
  const Subject = ({ initialState = false }: { initialState?: boolean }) => {
    const [state, onChange] = useCheckboxState(initialState);
    return (
      <div>
        <div data-testid="result">{state.toString()}</div>
        <input type="checkbox" onChange={onChange} data-testid="checkbox" />
      </div>
    );
  };

  it('updates state with checkbox state as expected', () => {
    const { getByTestId } = render(<Subject />);
    expect(getByTestId('result')).toHaveTextContent('false');
    fireEvent.click(getByTestId('checkbox'));
    expect(getByTestId('result')).toHaveTextContent('true');
    fireEvent.click(getByTestId('checkbox'));
    expect(getByTestId('result')).toHaveTextContent('false');
  });

  it('accepts an initial value', () => {
    const { getByTestId } = render(<Subject initialState={true} />);
    expect(getByTestId('result')).toHaveTextContent('true');
  });
});

describe('useNonce', () => {
  const Subject = ({}) => {
    const [nonce, refresh] = useNonce();
    return (
      <div>
        <span data-testid="nonce">{nonce}</span>
        <button data-testid="refresh" onClick={refresh} />
      </div>
    );
  };

  it('should render with an initial nonce', () => {
    const { getByTestId } = render(<Subject />);
    const initialNonce = getByTestId('nonce').textContent;
    expect(initialNonce).toBeDefined();
    expect(initialNonce).not.toBe('');
  });

  it('should change nonce on refresh', () => {
    const { getByTestId } = render(<Subject />);
    const refreshButton = getByTestId('refresh');

    // Click the button a few times for good measure;
    const knownNonces = [getByTestId('nonce').textContent as string];
    for (let idx = 0; idx < 3; idx++) {
      fireEvent.click(refreshButton);
      const afterRefreshNonce = getByTestId('nonce').textContent as string;
      expect(knownNonces).not.toContain(afterRefreshNonce);
      knownNonces.push(afterRefreshNonce);
    }
  });
});

describe('useInfoBoxMessage', () => {
  const selectedPlan = SELECTED_PLAN;
  const coupon = COUPON_DETAILS_VALID;

  const Subject = ({
    coupon,
    selectedPlan,
  }: {
    coupon: CouponDetails | undefined;
    selectedPlan: Plan;
  }) => {
    const infoBoxMessage = useInfoBoxMessage(coupon, selectedPlan);
    return infoBoxMessage ? (
      <div data-testid="info-box-message">
        <span data-testid="message">{infoBoxMessage.message}</span>
        {infoBoxMessage.couponDurationDate ? (
          <div data-testid="couponDurationDate-container">
            <span data-testid="couponDurationDate">
              {infoBoxMessage.couponDurationDate}
            </span>
          </div>
        ) : null}
      </div>
    ) : (
      <div data-testid="info-box-message-empty"></div>
    );
  };

  it('coupon has no value', () => {
    const { queryByTestId } = render(
      <Subject coupon={undefined} selectedPlan={selectedPlan} />
    );
    expect(queryByTestId('info-box-message')).not.toBeInTheDocument();
    expect(queryByTestId('info-box-message-empty')).toBeInTheDocument();
  });

  it('coupon type is "forever"', () => {
    const { queryByTestId } = render(
      <Subject
        coupon={{ ...coupon, type: 'forever' }}
        selectedPlan={selectedPlan}
      />
    );
    expect(queryByTestId('info-box-message')).not.toBeInTheDocument();
    expect(queryByTestId('info-box-message-empty')).toBeInTheDocument();
  });

  it('coupon type is an unexpected value', () => {
    const { queryByTestId } = render(
      <Subject
        coupon={{ ...coupon, type: 'unexpected-value' }}
        selectedPlan={selectedPlan}
      />
    );
    expect(queryByTestId('info-box-message')).not.toBeInTheDocument();
    expect(queryByTestId('info-box-message-empty')).toBeInTheDocument();
  });

  it('coupon type is "once"', () => {
    const { queryByTestId, getByTestId } = render(
      <Subject
        coupon={{ ...coupon, type: 'once' }}
        selectedPlan={selectedPlan}
      />
    );
    expect(
      queryByTestId('couponDurationDate-container')
    ).not.toBeInTheDocument();
    const messageText = getByTestId('message').textContent;
    expect(messageText).toBe(CouponInfoBoxMessageType.Default);
  });

  it('coupon type is "repeating" plan interval great than coupon duration', () => {
    const { queryByTestId, getByTestId } = render(
      <Subject
        coupon={{ ...coupon, type: 'once' }}
        selectedPlan={selectedPlan}
      />
    );
    expect(
      queryByTestId('couponDurationDate-container')
    ).not.toBeInTheDocument();
    const messageText = getByTestId('message').textContent;
    expect(messageText).toBe(CouponInfoBoxMessageType.Default);
  });

  it('coupon type is "repeating" and plan interval less than or equalcoupon duration', () => {
    const { getByTestId } = render(
      <Subject
        coupon={{ ...coupon, type: 'repeating' }}
        selectedPlan={selectedPlan}
      />
    );
    const date = new Date();
    const expectedCouponDurationDate = `${Math.round(
      new Date(
        date.setMonth(date.getMonth() + (coupon.durationInMonths || 1))
      ).getTime() / 1000
    )}`;
    const messageText = getByTestId('message').textContent;
    const couponDurationDate = getByTestId('couponDurationDate').textContent;
    expect(messageText).toBe(CouponInfoBoxMessageType.Repeating);
    expect(couponDurationDate).not.toBeNull();
    expect(couponDurationDate).toBe(expectedCouponDurationDate);
  });
});
