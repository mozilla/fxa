import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import PaymentProviderDetails from './index';
import * as Customers from '../../lib/mock-data';

afterEach(cleanup);

describe('PaymentProviderDetails', () => {
  describe('payment_method === "stripe" and an expirationDate is provided', () => {
    const subject = () => {
      return render(
        <PaymentProviderDetails {...{ customer: Customers.CUSTOMER }} />
      );
    };

    it('Renders credit card logo and last 4 digits', () => {
      const { queryByTestId } = subject();
      const element = queryByTestId('card-logo-and-last-four');
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass(`${Customers.CUSTOMER.brand?.toLowerCase()}`);
    });

    it('Omits paypal logo', () => {
      const { queryByTestId } = subject();
      expect(queryByTestId('paypal-logo')).not.toBeInTheDocument();
    });
  });

  describe('When payment_method === "paypal"', () => {
    const subject = () => {
      return render(
        <PaymentProviderDetails {...{ customer: Customers.PAYPAL_CUSTOMER }} />
      );
    };

    it('Renders paypal logo', () => {
      const { queryByTestId } = subject();
      expect(queryByTestId('paypal-logo')).toBeInTheDocument();
    });

    it('Omits credit card logo and last 4 digits', () => {
      const { queryByTestId } = subject();
      expect(queryByTestId('card-logo-and-last-four')).not.toBeInTheDocument();
    });
  });
});
