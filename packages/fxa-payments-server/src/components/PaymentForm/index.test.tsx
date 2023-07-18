import React from 'react';
import { cleanup, act, fireEvent, queryByTestId } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import waitForExpect from 'wait-for-expect';

import { Omit } from '../../lib/types';

import {
  mockStripeElementOnChangeFns,
  mockStripeElementOnBlurFns,
  elementChangeResponse,
  MOCK_CUSTOMER,
  renderWithLocalizationProvider,
} from '../../lib/test-utils';

import PaymentForm, { PaymentFormProps } from './index';
import { MOCK_EVENTS, SELECTED_PLAN } from '../../lib/mock-data';
import { ReactGALog } from '../../lib/reactga-event';

jest.mock('../../lib/sentry');
jest.mock('../../lib/reactga-event');

beforeEach(() => {
  jest.clearAllMocks();
  return cleanup();
});

// Redefine onPayment and onPaymentError as optional so we can supply mock
// functions by default in Subject.
type SubjectProps = Omit<
  PaymentFormProps,
  | 'onSubmit'
  | 'onMounted'
  | 'onEngaged'
  | 'onChange'
  | 'submitNonce'
  | 'getString'
> & {
  onSubmit?: PaymentFormProps['onSubmit'];
  onMounted?: PaymentFormProps['onMounted'];
  onEngaged?: PaymentFormProps['onEngaged'];
  onChange?: PaymentFormProps['onChange'];
  submitNonce?: string;
  getString?: PaymentFormProps['getString'];
};

const Subject = ({
  onSubmit = jest.fn(),
  onMounted = jest.fn(),
  onEngaged = jest.fn(),
  onChange = jest.fn(),
  submitNonce = 'test-nonce',
  getString,
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
        getString,
        ...props,
      }}
    />
  );
};

it('renders all expected default fields and elements', () => {
  const { container, queryAllByTestId, getByTestId } =
    renderWithLocalizationProvider(<Subject />);

  expect(container.querySelector('button.cancel')).not.toBeInTheDocument();
  expect(container.querySelector('span.spinner')).not.toBeInTheDocument();
  expect(queryByTestId(container, 'loading-spinner')).not.toBeInTheDocument();
  expect(getByTestId('submit')).toHaveClass('payment-button-disabled');

  for (let testid of ['name', 'cardElement']) {
    expect(queryAllByTestId(testid).length).toEqual(1);
  }
});

it('renders error tooltips for invalid stripe elements', () => {
  const { getByTestId } = renderWithLocalizationProvider(<Subject />);

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
  const renderResult = renderWithLocalizationProvider(<Subject {...props} />);
  const { getByTestId } = renderResult;

  expect(getByTestId('submit')).toHaveClass('payment-button-disabled');
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
  expect(getByTestId('submit')).not.toHaveClass('payment-button-disabled');
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
    plan: SELECTED_PLAN,
  });
  expect(getByTestId('submit')).toHaveClass('payment-button-disabled');
  fireEvent.click(getByTestId('confirm'));
  expect(getByTestId('submit')).not.toHaveClass('payment-button-disabled');
  expect(ReactGALog.logEvent).toBeCalledTimes(1);
  expect(ReactGALog.logEvent).toBeCalledWith(
    MOCK_EVENTS.AddPaymentInfo(SELECTED_PLAN)
  );
});

it('omits the confirmation checkbox when confirm = false', () => {
  const { queryByTestId } = renderWithLocalizationProvider(
    <Subject {...{ confirm: false }} />
  );
  expect(queryByTestId('confirm')).not.toBeInTheDocument();
  expect(ReactGALog.logEvent).not.toBeCalled();
});

it('includes the confirmation checkbox when confirm = true and plan supplied', () => {
  const { queryByTestId } = renderWithLocalizationProvider(
    <Subject {...{ confirm: true, plan: SELECTED_PLAN }} />
  );
  expect(queryByTestId('confirm')).toBeInTheDocument();
  expect(ReactGALog.logEvent).not.toBeCalled();
});

it('calls onSubmit when all fields valid and submitted', async () => {
  const onSubmit = jest.fn();
  let { getByTestId } = renderWithValidFields({
    onSubmit,
    onChange: () => {},
  });
  const submitButton = getByTestId('submit');
  expect(submitButton).not.toHaveClass('payment-button-disabled');
  fireEvent.click(submitButton);
  expect(onSubmit).toHaveBeenCalled();
  // logs add_payment_info and purchase_submit
  expect(ReactGALog.logEvent).toBeCalledTimes(2);
});

it('renders a progress spinner when submitted, disables further submission (issue #4386 / FXA-1275)', async () => {
  const onSubmit = jest.fn();

  const { queryByTestId, getByTestId } = renderWithValidFields({
    onSubmit,
    submitNonce: 'unique-nonce-1',
  });

  const submitButton = getByTestId('submit');
  fireEvent.click(submitButton);

  await waitForExpect(() => expect(onSubmit).toHaveBeenCalled());

  expect(queryByTestId('loading-spinner')).toBeInTheDocument();
  expect(getByTestId('submit')).toHaveClass(
    'payment-button cta-primary !font-bold w-full mt-8 h-12 cursor-pointer'
  );

  fireEvent.submit(getByTestId('paymentForm'));
  fireEvent.click(submitButton);

  expect(onSubmit).toHaveBeenCalledTimes(1);
});

it('renders a progress spinner when inProgress = true', () => {
  const { queryByTestId } = renderWithLocalizationProvider(
    <Subject {...{ inProgress: true }} />
  );
  expect(queryByTestId('loading-spinner')).toBeInTheDocument();
});

it('renders a progress spinner when inProgress = true and onCancel supplied', () => {
  const onCancel = jest.fn();
  const { queryByTestId } = renderWithLocalizationProvider(
    <Subject {...{ inProgress: true, onCancel }} />
  );
  expect(queryByTestId('loading-spinner')).toBeInTheDocument();
});

it('includes the cancel button when onCancel supplied', () => {
  const { queryByTestId } = renderWithLocalizationProvider(
    <Subject {...{ onCancel: jest.fn() }} />
  );
  expect(queryByTestId('cancel')).toBeInTheDocument();
});

it('displays an error for empty name', () => {
  const { getByText, getByTestId } = renderWithLocalizationProvider(
    <Subject />
  );
  fireEvent.change(getByTestId('name'), { target: { value: '123' } });
  fireEvent.change(getByTestId('name'), { target: { value: '' } });
  fireEvent.blur(getByTestId('name'));
  expect(getByText('Please enter your name')).toBeInTheDocument();
  expect(ReactGALog.logEvent).not.toBeCalled();
});

it('submit button should still be enabled when all fields are valid', () => {
  let { getByTestId } = renderWithValidFields();
  expect(getByTestId('submit')).not.toHaveClass('payment-button-disabled');
  // logs add_payment_info
  expect(ReactGALog.logEvent).toBeCalledTimes(1);
});

it('does not call onSubmit if somehow submitted without confirm checked', async () => {
  const onSubmit = jest.fn();
  // renderWithValidFields does not check the confirm box
  let { getByTestId } = renderWithValidFields({
    confirm: true,
    plan: SELECTED_PLAN,
    onSubmit,
    onChange: () => {},
  });
  // The user shouldn't be able to click a disabled submit button...
  const submitButton = getByTestId('submit');
  expect(submitButton).toHaveClass('payment-button-disabled');
  // ...but let's force the form to submit and assert nothing happens.
  fireEvent.submit(getByTestId('paymentForm'));
  expect(onSubmit).not.toHaveBeenCalled();
  expect(ReactGALog.logEvent).not.toBeCalled();
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
  expect(submitButton).toHaveClass(
    'payment-button cta-primary !font-bold w-full mt-8 h-12 cursor-pointer'
  );
  // ...but let's force the form to submit and assert nothing happens.
  fireEvent.submit(getByTestId('paymentForm'));
  expect(onSubmit).not.toHaveBeenCalled();
});

describe('with existing card', () => {
  it('renders correctly', () => {
    const { queryByTestId, queryByText } = renderWithLocalizationProvider(
      <Subject customer={MOCK_CUSTOMER} plan={SELECTED_PLAN} />
    );
    expect(queryByTestId('card-logo-and-last-four')).toBeInTheDocument();
    expect(queryByTestId('name')).not.toBeInTheDocument();
    expect(
      queryByText(`Card ending in ${MOCK_CUSTOMER.last4}`)
    ).toBeInTheDocument();
  });

  it('renders the payment form for customer without subscriptions', () => {
    const customer = { ...MOCK_CUSTOMER, subscriptions: [] };
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject customer={customer} />
    );
    expect(queryByTestId('name')).toBeInTheDocument();
    expect(queryByTestId('card-details')).not.toBeInTheDocument();
  });

  it('calls the submit handler', async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = renderWithLocalizationProvider(
      <Subject
        customer={MOCK_CUSTOMER}
        plan={SELECTED_PLAN}
        confirm={false}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(getByTestId('submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(ReactGALog.logEvent).toBeCalledTimes(1);
    expect(ReactGALog.logEvent).toBeCalledWith(
      MOCK_EVENTS.PurchaseSubmitNew(SELECTED_PLAN)
    );
  });
});

describe('with existing PayPal billing agreement', () => {
  it('renders correctly', () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject
        customer={{ ...MOCK_CUSTOMER, payment_provider: 'paypal' }}
        plan={SELECTED_PLAN}
      />
    );
    expect(queryByTestId('card-logo-and-last-four')).not.toBeInTheDocument();
    expect(queryByTestId('paypal-logo')).toBeInTheDocument();
  });

  it('calls the submit handler', async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = renderWithLocalizationProvider(
      <Subject
        customer={{ ...MOCK_CUSTOMER, payment_provider: 'paypal' }}
        plan={SELECTED_PLAN}
        confirm={false}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(getByTestId('submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // confirm checkbox was not checked
    expect(ReactGALog.logEvent).not.toBeCalled();
  });
});
