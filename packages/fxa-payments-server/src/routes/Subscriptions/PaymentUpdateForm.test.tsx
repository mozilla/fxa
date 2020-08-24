import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { LocalizationProvider, ReactLocalization } from '@fluent/react';

import PaymentForm from '../../components/PaymentForm';
jest.mock('../../components/PaymentForm', () => {
  return jest.fn().mockImplementation(() => <div></div>);
});
import { PaymentUpdateForm, PaymentUpdateFormProps } from './PaymentUpdateForm';
import { CUSTOMER } from '../../lib/mock-data';
import defaultState from 'fxa-payments-server/src/store/state';

const { queryByTestId, queryByText, getByTestId } = screen;

const baseProps: PaymentUpdateFormProps = {
  customer: CUSTOMER,
  resetUpdatePayment: jest.fn(),
  updatePayment: jest.fn().mockResolvedValue(null),
  updatePaymentStatus: defaultState.updatePayment,
};

describe('PaymentUpdateFormV1', () => {
  it('renders with payment update form hidden initially', () => {
    render(<PaymentUpdateForm {...baseProps} />);
    expect(queryByTestId('card-details')).toBeInTheDocument();
    expect(queryByTestId('paymentForm')).not.toBeInTheDocument();
  });

  it('reveals the payment update form on clicking Change button', () => {
    render(<PaymentUpdateForm {...baseProps} />);
    expect(queryByTestId('card-details')).toBeInTheDocument();
    fireEvent.click(getByTestId('reveal-payment-update-button'));
    expect(PaymentForm).toHaveBeenCalledTimes(1);
  });

  it('renders with l10n', () => {
    const bundle = new FluentBundle('gd', { useIsolating: false });
    [
      'sub-update-title = CC Info',
      'sub-update-card-ending = last four { $last }',
      'pay-update-card-exp = all over on { $expirationDate }',
      'pay-update-change-btn = gogo',
    ].forEach((x) => bundle.addResource(new FluentResource(x)));
    render(
      <LocalizationProvider l10n={new ReactLocalization([bundle])}>
        <PaymentUpdateForm {...baseProps} />
      </LocalizationProvider>
    );
    expect(queryByText('CC Info')).toBeInTheDocument();
    expect(queryByText('last four 5309')).toBeInTheDocument();
    expect(queryByText('all over on February 2099')).toBeInTheDocument();
    expect(queryByText('gogo')).toBeInTheDocument();
  });
});
