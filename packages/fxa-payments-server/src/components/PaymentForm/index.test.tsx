import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import waitForExpect from 'wait-for-expect';

import { Omit } from '../../lib/types';

import {
  mockStripeElementOnChangeFns,
  mockStripeElementOnBlurFns,
  elementChangeResponse,
  MOCK_CUSTOMER,
} from '../../lib/test-utils';

import PaymentForm, { PaymentFormProps } from './index';

jest.mock('../../lib/sentry');

const MOCK_PLAN = {
  plan_id: 'plan_123',
  product_id: '123doneProProduct',
  product_name: 'Example Product',
  currency: 'USD',
  amount: 1050,
  interval: 'month' as const,
  interval_count: 1,
};

afterEach(cleanup);

// Redefine onPayment and onPaymentError as optional so we can supply mock
// functions by default in Subject.
type SubjectProps = Omit<
  PaymentFormProps,
  'onSubmit' | 'onMounted' | 'onEngaged' | 'onChange' | 'submitNonce'
> & {
  onSubmit?: PaymentFormProps['onSubmit'];
  onMounted?: PaymentFormProps['onMounted'];
  onEngaged?: PaymentFormProps['onEngaged'];
  onChange?: PaymentFormProps['onChange'];
  submitNonce?: string;
};
const Subject = ({
  onSubmit = jest.fn(),
  onMounted = jest.fn(),
  onEngaged = jest.fn(),
  onChange = jest.fn(),
  submitNonce = 'test-nonce',
  ...props
}: SubjectProps) => {
  return (
    <PaymentForm
      {...{
        onSubmit,
        onMounted,
        onEngaged,
        onChange,
        submitNonce,
        getString: null,
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

  for (let testid of ['name', 'cardElement']) {
    expect(queryAllByTestId(testid).length).toEqual(1);
  }
});

it('renders error tooltips for invalid stripe elements', () => {
  const { getByTestId } = render(<Subject />);

  const mockErrors = {
    cardElement: 'CARD BAD',
  };

  act(() => {
    for (const [testid, errorMessage] of Object.entries(mockErrors)) {
      mockStripeElementOnChangeFns[testid](
        elementChangeResponse({ errorMessage, value: 'foo' })
      );
      mockStripeElementOnBlurFns[testid](
        elementChangeResponse({ errorMessage, value: 'foo' })
      );
    }
  });

  for (const [testid, expectedMessage] of Object.entries(mockErrors)) {
    const el = getByTestId(testid);
    const tooltipEl = (el.parentNode?.parentNode as ParentNode).querySelector(
      '.tooltip'
    );
    expect(tooltipEl).not.toBeNull();
    expect((tooltipEl as Node).textContent).toEqual(expectedMessage);
  }
});

const renderWithValidFields = (props?: SubjectProps) => {
  const renderResult = render(<Subject {...props} />);
  const { getByTestId } = renderResult;

  expect(getByTestId('submit')).toHaveAttribute('disabled');
  fireEvent.change(getByTestId('name'), { target: { value: 'Foo Barson' } });
  fireEvent.blur(getByTestId('name'));

  const stripeFields = ['cardElement'];

  act(() => {
    for (const testid of stripeFields) {
      mockStripeElementOnChangeFns[testid](
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

it('calls onMounted and onEngaged', () => {
  const onMounted = jest.fn();
  const onEngaged = jest.fn();

  renderWithValidFields({ onMounted, onEngaged });

  expect(onMounted).toBeCalledTimes(1);
  expect(onEngaged).toBeCalledTimes(1);
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

it('calls onSubmit when all fields valid and submitted', async () => {
  const onSubmit = jest.fn();
  let { getByTestId } = renderWithValidFields({
    onSubmit,
    onChange: () => {},
  });
  const submitButton = getByTestId('submit');
  expect(submitButton).not.toHaveAttribute('disabled');
  fireEvent.click(submitButton);
  expect(onSubmit).toHaveBeenCalled();
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
  fireEvent.blur(getByTestId('name'));
  expect(getByText('Please enter your name')).toBeInTheDocument();
});

it('submit button should still be enabled when all fields are valid', () => {
  let { getByTestId } = renderWithValidFields();
  expect(getByTestId('submit')).not.toHaveAttribute('disabled');
});

it('does not call onSubmit if somehow submitted without confirm checked', async () => {
  const onSubmit = jest.fn();
  // renderWithValidFields does not check the confirm box
  let { getByTestId } = renderWithValidFields({
    confirm: true,
    plan: MOCK_PLAN,
    onSubmit,
    onChange: () => {},
  });
  // The user shouldn't be able to click a disabled submit button...
  const submitButton = getByTestId('submit');
  expect(submitButton).toHaveAttribute('disabled');
  // ...but let's force the form to submit and assert nothing happens.
  fireEvent.submit(getByTestId('paymentForm'));
  expect(onSubmit).not.toHaveBeenCalled();
});

it('does not call onSubmit if somehow submitted while in progress', async () => {
  const onSubmit = jest.fn();
  let { getByTestId } = renderWithValidFields({
    inProgress: true,
    onSubmit,
    onChange: () => {},
  });
  // The user shouldn't be able to click a disabled submit button...
  const submitButton = getByTestId('submit');
  expect(submitButton).toHaveAttribute('disabled');
  // ...but let's force the form to submit and assert nothing happens.
  fireEvent.submit(getByTestId('paymentForm'));
  expect(onSubmit).not.toHaveBeenCalled();
});

describe('with existing card', () => {
  it('renders correctly', () => {
    const { queryByTestId, queryByText } = render(
      <Subject customer={MOCK_CUSTOMER} plan={MOCK_PLAN} />
    );
    expect(queryByTestId('card-logo-and-last-four')).toBeInTheDocument();
    expect(queryByTestId('name')).not.toBeInTheDocument();
    expect(
      queryByText(`Card ending in ${MOCK_CUSTOMER.last4}`)
    ).toBeInTheDocument();
  });

  it('renders the payment form for customer without subscriptions', () => {
    const customer = { ...MOCK_CUSTOMER, subscriptions: [] };
    const { queryByTestId } = render(<Subject customer={customer} />);
    expect(queryByTestId('name')).toBeInTheDocument();
    expect(queryByTestId('card-details')).not.toBeInTheDocument();
  });

  it('calls the submit handler', async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(
      <Subject
        customer={MOCK_CUSTOMER}
        plan={MOCK_PLAN}
        confirm={false}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(getByTestId('submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('with existing PayPal billing agreement', () => {
  it('renders correctly', () => {
    const { queryByTestId } = render(
      <Subject
        customer={{ ...MOCK_CUSTOMER, payment_provider: 'paypal' }}
        plan={MOCK_PLAN}
      />
    );
    expect(queryByTestId('card-logo-and-last-four')).not.toBeInTheDocument();
    expect(queryByTestId('paypal-logo')).toBeInTheDocument();
  });

  it('calls the submit handler', async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(
      <Subject
        customer={{ ...MOCK_CUSTOMER, payment_provider: 'paypal' }}
        plan={MOCK_PLAN}
        confirm={false}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(getByTestId('submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
