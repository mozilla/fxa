import React, { useRef } from 'react';
import { render, cleanup, prettyDOM } from '@testing-library/react';
import 'jest-dom/extend-expect';
import { StripeProvider } from 'react-stripe-elements';
import PaymentForm, { PaymentFormProps } from './index';

let elementMock;
let elementsMock: { create: jest.Mock<any,any> };
let stripeMock: stripe.Stripe;

beforeEach(() => {
  elementMock = {
    mount: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    update: jest.fn(),
  };
  elementsMock = {
    create: jest.fn().mockReturnValue(elementMock),
  };
  stripeMock = {
    elements: jest.fn().mockReturnValue(elementsMock),
    createToken: jest.fn(),
    createSource: jest.fn(),
    createPaymentMethod: jest.fn(),
    handleCardPayment: jest.fn(),
    retrieveSource: jest.fn(),
    paymentRequest:jest.fn(),
    redirectToCheckout: jest.fn(),
    retrievePaymentIntent: jest.fn(),
    handleCardAction: jest.fn(),
    confirmPaymentIntent: jest.fn(),
  };
});

afterEach(cleanup);

type SubjectProps = PaymentFormProps;

const Subject = (props: SubjectProps) => {
  return (
    <StripeProvider stripe={stripeMock}>
      <PaymentForm {...props} />
    </StripeProvider>
  );
};

it('renders all expected fields', () => {
  const onPayment = jest.fn();
  const onPaymentError = jest.fn();
  
  const { queryByTestId } = render(
    <Subject {...{ onPayment, onPaymentError }} />
  );

  expect(queryByTestId('name')).toBeInTheDocument();
  expect(queryByTestId('zip')).toBeInTheDocument();

  const elementsCreated = elementsMock.create.mock.calls.map(call => call[0]);
  expect(elementsCreated).toContain('cardNumber');
  expect(elementsCreated).toContain('cardExpiry');
  expect(elementsCreated).toContain('cardCvc');
});