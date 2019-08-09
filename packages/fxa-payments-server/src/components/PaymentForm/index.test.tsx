import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import 'jest-dom/extend-expect';
import waitForExpect from 'wait-for-expect';
import { Omit } from '../../lib/types';

// Minimal mock for react-stripe-elements that lets us trigger onChange
// handlers with testing data
const MockStripeElement = ({ testid }: { testid: string }) =>
  class extends React.Component {
    _ref: null;
    setRef: (el: any) => void;

    constructor(props: ReactStripeElements.ElementProps) {
      super(props);

      // Stash this element's onChange handler in module-global registry.
      const { onChange } = props;
      onChangeFns[testid] = onChange as onChangeFunctionType;

      // Real react-stripe-elements stash a ref to their container in
      // this._ref, which we use for tooltip positioning
      this._ref = null;
      this.setRef = el => (this._ref = el);
    }

    render() {
      return (
        <div ref={this.setRef} data-testid={testid}>
          {testid}
        </div>
      );
    }
  };

// onChange handler registry - indexed by per-component testid, of which
// there should only be one instance per PaymentForm
type onChangeFunctionType = (
  value: stripe.elements.ElementChangeResponse
) => void;
const onChangeFns: { [name: string]: onChangeFunctionType } = {};

// Mock out the Stripe elements we use in PaymentForm
jest.setMock(
  'react-stripe-elements',
  Object.assign(require.requireActual('react-stripe-elements'), {
    CardNumberElement: MockStripeElement({ testid: 'cardNumberElement' }),
    CardExpiryElement: MockStripeElement({ testid: 'cardExpiryElement' }),
    CardCVCElement: MockStripeElement({ testid: 'cardCVCElement' }),
  })
);

import { ReactStripeElements } from 'react-stripe-elements';
import { PaymentForm, PaymentFormProps, PaymentFormStripeProps } from './index';

const MOCK_PLAN = {
  plan_id: 'plan_123',
  plan_name: 'Example Plan',
  product_id: '123doneProProduct',
  product_name: 'Example Product',
  currency: 'USD',
  amount: 1050,
  interval: 'month',
};

const VALID_CREATE_TOKEN_RESPONSE: stripe.TokenResponse = {
  token: {
    id: 'tok_8675309',
    object: 'test',
    client_ip: '123.123.123.123',
    created: Date.now(),
    livemode: false,
    type: 'card',
    used: false,
  },
};

const elementChangeResponse = ({
  complete = true,
  value,
  errorMessage,
}: {
  complete?: boolean;
  value?: any;
  errorMessage?: string;
}): stripe.elements.ElementChangeResponse => ({
  elementType: 'test',
  brand: 'test',
  value: 'boof',
  complete,
  empty: !!value,
  error:
    (!!errorMessage && {
      type: 'test',
      charge: 'test',
      message: errorMessage,
    }) ||
    undefined,
});

afterEach(cleanup);

// Redefine onPayment and onPaymentError as optional so we can supply mock
// functions by default in Subject.
type SubjectProps = Omit<PaymentFormProps, 'onPayment' | 'onPaymentError'> & {
  onPayment?: (tokenResponse: stripe.TokenResponse, name: string) => void;
  onPaymentError?: (error: any) => void;
};
const Subject = ({
  onPayment = jest.fn(),
  onPaymentError = jest.fn(),
  ...props
}: SubjectProps) => {
  return (
    <PaymentForm
      {...{
        onPayment,
        onPaymentError,
        ...props,
      }}
    />
  );
};

it('renders all expected default fields and elements', () => {
  const { container, queryAllByTestId, getByTestId } = render(<Subject />);

  expect(container.querySelector('button.cancel')).not.toBeInTheDocument();
  expect(container.querySelector('span.spinner')).not.toBeInTheDocument();
  expect(getByTestId('submit')).toHaveAttribute('disabled');

  for (let testid of [
    'name',
    'zip',
    'cardNumberElement',
    'cardExpiryElement',
    'cardCVCElement',
  ]) {
    expect(queryAllByTestId(testid).length).toEqual(1);
  }
});

it('renders error tooltips for invalid stripe elements', () => {
  const { getByTestId } = render(<Subject />);

  const mockErrors = {
    cardNumberElement: 'NUMBER BAD',
    cardCVCElement: 'CVC BAD',
    cardExpiryElement: 'EXP BAD',
  };

  act(() => {
    for (const [testid, errorMessage] of Object.entries(mockErrors)) {
      onChangeFns[testid](elementChangeResponse({ errorMessage }));
    }
  });

  for (const [testid, expectedMessage] of Object.entries(mockErrors)) {
    const el = getByTestId(testid);
    const tooltipEl = (el.parentNode as ParentNode).querySelector('.tooltip');
    expect(tooltipEl).toBeDefined();
    expect((tooltipEl as Node).textContent).toEqual(expectedMessage);
  }
});

const renderWithValidFields = (props?: SubjectProps) => {
  const renderResult = render(<Subject {...props} />);
  const { getByTestId } = renderResult;

  expect(getByTestId('submit')).toHaveAttribute('disabled');
  fireEvent.change(getByTestId('name'), { target: { value: 'Foo Barson' } });
  fireEvent.change(getByTestId('zip'), { target: { value: '90210' } });

  const stripeFields = [
    'cardNumberElement',
    'cardCVCElement',
    'cardExpiryElement',
  ];

  act(() => {
    for (const testid of stripeFields) {
      onChangeFns[testid](
        elementChangeResponse({ complete: true, value: 'test' })
      );
    }
  });

  return renderResult;
};

it('enables submit button when all fields are valid', () => {
  let { getByTestId } = renderWithValidFields();
  expect(getByTestId('submit')).not.toHaveAttribute('disabled');
});

it('when confirm = true, enables submit button when all fields are valid and checkbox checked', () => {
  let { getByTestId } = renderWithValidFields({
    confirm: true,
    plan: MOCK_PLAN,
  });
  expect(getByTestId('submit')).toHaveAttribute('disabled');
  fireEvent.click(getByTestId('confirm'));
  expect(getByTestId('submit')).not.toHaveAttribute('disabled');
});

it('omits the confirmation checkbox when confirm = false', () => {
  const { queryByTestId } = render(<Subject {...{ confirm: false }} />);
  expect(queryByTestId('confirm')).not.toBeInTheDocument();
});

it('includes the confirmation checkbox when confirm = true and plan supplied', () => {
  const { queryByTestId } = render(
    <Subject {...{ confirm: true, plan: MOCK_PLAN }} />
  );
  expect(queryByTestId('confirm')).toBeInTheDocument();
});

it('renders a progress spinner when inProgress = true', () => {
  const { queryByTestId } = render(<Subject {...{ inProgress: true }} />);
  expect(queryByTestId('spinner-submit')).toBeInTheDocument();
});

it('renders a progress spinner when inProgress = true and onCancel supplied', () => {
  const onCancel = jest.fn();
  const { queryByTestId } = render(
    <Subject {...{ inProgress: true, onCancel }} />
  );
  expect(queryByTestId('spinner-update')).toBeInTheDocument();
});

it('includes the cancel button when onCancel supplied', () => {
  const { queryByTestId } = render(<Subject {...{ onCancel: jest.fn() }} />);
  expect(queryByTestId('cancel')).toBeInTheDocument();
});

it('displays an error for empty name', () => {
  const { getByText, getByTestId } = render(<Subject />);
  fireEvent.change(getByTestId('name'), { target: { value: '123' } });
  fireEvent.change(getByTestId('name'), { target: { value: '' } });
  expect(getByText('Please enter your name')).toBeInTheDocument();
});

it('displays an error for empty zip code', () => {
  const { getByText, getByTestId } = render(<Subject />);
  fireEvent.change(getByTestId('zip'), { target: { value: '123' } });
  fireEvent.change(getByTestId('zip'), { target: { value: '' } });
  expect(getByText('Zip code is required')).toBeInTheDocument();
});

it('displays an error for a short zip code', () => {
  const { getByTestId, getByText } = render(<Subject />);
  fireEvent.change(getByTestId('zip'), { target: { value: '123' } });
  expect(getByText('Zip code is too short')).toBeInTheDocument();
});

it('fails silently on submit if a stripe API reference has not been supplied', () => {
  let { getByTestId } = renderWithValidFields();
  fireEvent.submit(getByTestId('paymentForm'));
});

it('enables submit button when all fields are valid', () => {
  let { getByTestId } = renderWithValidFields();
  expect(getByTestId('submit')).not.toHaveAttribute('disabled');
});

it('does not call stripe.createToken if somehow submitted with invalid fields', async () => {
  const stripe: PaymentFormStripeProps = {
    createToken: jest.fn().mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE),
  };
  const onPayment = jest.fn();
  let { getByTestId } = renderWithValidFields({
    confirm: true,
    plan: MOCK_PLAN,
    onPayment,
    stripe,
  });
  // The user shouldn't be able to click a disabled submit button...
  const submitButton = getByTestId('submit');
  expect(submitButton).toHaveAttribute('disabled');
  // ...but let's force the form to submit and assert nothing happens.
  fireEvent.submit(getByTestId('paymentForm'));
  expect(stripe.createToken).not.toHaveBeenCalled();
});

it('calls onPayment when payment processing succeeds', async () => {
  const stripe: PaymentFormStripeProps = {
    createToken: jest.fn().mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE),
  };
  const onPayment = jest.fn();
  const { getByTestId } = renderWithValidFields({ stripe, onPayment });
  const submitButton = getByTestId('submit');
  expect(submitButton).not.toHaveAttribute('disabled');
  fireEvent.click(submitButton);
  expect(stripe.createToken).toHaveBeenCalled();
  await waitForExpect(() =>
    expect(onPayment).toHaveBeenCalledWith(
      VALID_CREATE_TOKEN_RESPONSE,
      'Foo Barson'
    )
  );
});

it('calls onPaymentError when payment processing fails', async () => {
  const stripe: PaymentFormStripeProps = {
    createToken: jest.fn().mockRejectedValue('BAD THINGS'),
  };
  const onPayment = jest.fn();
  const onPaymentError = jest.fn();
  const { getByTestId } = renderWithValidFields({
    stripe,
    onPayment,
    onPaymentError,
  });
  const submitButton = getByTestId('submit');
  expect(submitButton).not.toHaveAttribute('disabled');
  fireEvent.click(submitButton);
  expect(stripe.createToken).toHaveBeenCalled();
  await waitForExpect(() =>
    expect(onPaymentError).toHaveBeenCalledWith('BAD THINGS')
  );
});
