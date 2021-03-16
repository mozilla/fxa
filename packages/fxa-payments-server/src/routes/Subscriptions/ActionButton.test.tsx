import React from 'react';
import { screen, render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ActionButton, { ActionButtonProps } from './ActionButton';
import { CUSTOMER } from '../../lib/mock-data';
import { PickPartial } from '../../lib/types';
import { defaultConfig } from '../../lib/config';

const { apiUrl } = defaultConfig().paypal;

describe('routes/Subscriptions/ActionButton', () => {
  type SubjectProps = PickPartial<
    ActionButtonProps,
    'customer' | 'onRevealUpdateClick' | 'revealFixPaymentModal'
  >;
  const Subject = ({
    customer = CUSTOMER,
    onRevealUpdateClick = jest.fn(),
    revealFixPaymentModal = jest.fn(),
  }: SubjectProps) => {
    return (
      <ActionButton
        {...{
          customer,
          onRevealUpdateClick,
          revealFixPaymentModal,
        }}
      />
    );
  };

  afterEach(() => {
    return cleanup();
  });

  it('renders revealonclick button when payment_provider is "stripe"', async () => {
    const onRevealUpdateClick = jest.fn();
    render(<Subject onRevealUpdateClick={onRevealUpdateClick} />);
    const revealButton = screen.getByTestId('reveal-payment-update-button');
    expect(revealButton).toBeInTheDocument();
    fireEvent.click(revealButton);
    expect(onRevealUpdateClick).toBeCalled();
  });

  it('renders paypalActionButton when paypal is payment provider and paypal_payment_error is not set', async () => {
    render(
      <Subject
        customer={{
          ...CUSTOMER,
          payment_provider: 'paypal',
        }}
      />
    );
    const revealButton = screen.getByTestId('change-payment-update-button');
    expect(revealButton).toBeInTheDocument();
    expect(revealButton.getAttribute('href')).toEqual(
      `${apiUrl}/myaccount/autopay/connect/${CUSTOMER.billing_agreement_id}`
    );
  });

  it('renders paypalFundingSourceActionButton when paypal is payment provider and paypal_payment_error is set to "funding_source"', async () => {
    render(
      <Subject
        customer={{
          ...CUSTOMER,
          payment_provider: 'paypal',
          paypal_payment_error: 'funding_source',
        }}
      />
    );
    const revealButton = screen.getByTestId('manage-payment-update-button');
    expect(revealButton).toBeInTheDocument();
    expect(revealButton.getAttribute('href')).toEqual(
      `${apiUrl}/myaccount/autopay/connect/${CUSTOMER.billing_agreement_id}`
    );
  });

  it('renders paypalMissingAgreementActionButton when paypal is payment provider and paypal_payment_error is set to "missing_agreement"', async () => {
    const revealFixPaymentModal = jest.fn();
    render(
      <Subject
        revealFixPaymentModal={revealFixPaymentModal}
        customer={{
          ...CUSTOMER,
          payment_provider: 'paypal',
          paypal_payment_error: 'missing_agreement',
          billing_agreement_id: '',
        }}
      />
    );
    const revealButton = screen.getByTestId('reveal-payment-modal-button');
    expect(revealButton).toBeInTheDocument();
    fireEvent.click(revealButton);
    expect(revealFixPaymentModal).toBeCalled();
  });
});
