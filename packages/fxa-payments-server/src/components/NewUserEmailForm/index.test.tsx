import React, { useState } from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { apiFetchAccountStatus } from '../../lib/apiClient';
import {
  NewUserEmailForm,
  emailInputValidationAndAccountCheck,
  checkAccountExists,
} from './index';
import { Localized } from '@fluent/react';
import { CheckoutType } from 'fxa-shared/subscriptions/types';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

jest.mock('../../lib/apiClient', () => ({
  apiFetchAccountStatus: jest.fn(),
}));
const selectedPlan = {
  plan_id: 'planId',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month' as const,
  interval_count: 1,
  plan_metadata: {
    'product:subtitle': 'FPN subtitle',
    'product:details:1': 'Detail 1',
    'product:details:2': 'Detail 2',
    'product:details:3': 'Detail 3',
  },
  checkout_type: CheckoutType.WITHOUT_ACCOUNT,
};

const WrapNewUserEmailForm = ({
  accountExistsReturnValue,
  invalidDomain,
  plan = selectedPlan,
}: {
  accountExistsReturnValue: boolean;
  invalidDomain: boolean;
  plan?: any;
}) => {
  const [, setValidEmail] = useState<string>('');
  const [, setAccountExists] = useState(false);
  const [, setInvalidEmailDomain] = useState(false);
  const [, setEmailsMatch] = useState(false);
  (apiFetchAccountStatus as jest.Mock)
    .mockClear()
    .mockResolvedValue({ exists: accountExistsReturnValue });

  return (
    <div style={{ display: 'flex' }}>
      <NewUserEmailForm
        signInURL={
          'https://localhost:3031/subscriptions/products/productId?plan=planId&signin=yes'
        }
        setEmailsMatch={setEmailsMatch}
        setValidEmail={setValidEmail}
        setAccountExists={setAccountExists}
        setInvalidEmailDomain={setInvalidEmailDomain}
        getString={(id: string) => id}
        checkAccountExists={() =>
          Promise.resolve({
            exists: accountExistsReturnValue,
            invalidDomain,
          })
        }
        onToggleNewsletterCheckbox={() => {}}
        selectedPlan={plan}
      />
    </div>
  );
};

describe('NewUserEmailForm test', () => {
  it('renders as expected', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <WrapNewUserEmailForm
          accountExistsReturnValue={false}
          invalidDomain={false}
        />
      );
    };

    const { queryByTestId } = subject();
    const form = queryByTestId('new-user-email-form');
    expect(form).toBeInTheDocument();

    const signInCopy = queryByTestId('sign-in-copy');
    expect(signInCopy).toBeInTheDocument();

    const firstEmail = queryByTestId('new-user-enter-email');
    expect(firstEmail).toBeInTheDocument();

    const secondEmail = queryByTestId('new-user-confirm-email');
    expect(secondEmail).toBeInTheDocument();

    const subscribeCheckbox = queryByTestId(
      'new-user-subscribe-product-updates'
    );
    expect(subscribeCheckbox).toBeInTheDocument();
    expect(subscribeCheckbox?.nextSibling?.textContent).toBe(
      'I’d like to receive product news and updates from Mozilla'
    );

    const assuranceCopy = queryByTestId('assurance-copy');
    expect(assuranceCopy).toBeInTheDocument();
  });

  it('renders as expected, with metadata configuration', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <WrapNewUserEmailForm
          accountExistsReturnValue={false}
          invalidDomain={false}
          plan={{
            ...selectedPlan,
            product_metadata: {
              newsletterLabelTextCode: 'snp',
            },
          }}
        />
      );
    };
    const { queryByTestId } = subject();
    const subscribeCheckbox = queryByTestId(
      'new-user-subscribe-product-updates'
    );
    expect(subscribeCheckbox).toBeInTheDocument();
    expect(subscribeCheckbox?.nextSibling?.textContent).toBe(
      'I’d like to receive security and privacy news and updates from Mozilla'
    );
  });

  it('shows error when invalid email is input to first field', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <WrapNewUserEmailForm
          accountExistsReturnValue={false}
          invalidDomain={false}
        />
      );
    };

    const { getByTestId, queryByText } = subject();
    const firstEmail = getByTestId('new-user-enter-email');

    fireEvent.change(firstEmail, { target: { value: 'invalid-email' } });
    fireEvent.blur(firstEmail);

    await waitFor(() => {
      expect(queryByText('new-user-email-validate')).toBeVisible();
    });
  });

  it('shows no error when valid email is input to first field', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <WrapNewUserEmailForm
          accountExistsReturnValue={false}
          invalidDomain={false}
        />
      );
    };

    const { getByTestId, queryByText } = subject();
    const firstEmail = getByTestId('new-user-enter-email');
    fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
    fireEvent.blur(firstEmail);

    await waitFor(() => {
      expect(queryByText('new-user-email-validate')).toBeFalsy();
    });
  });

  it('shows no error when empty string is provided to second field', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <WrapNewUserEmailForm
          accountExistsReturnValue={false}
          invalidDomain={false}
        />
      );
    };

    const { getByTestId, queryByText } = subject();

    const firstEmail = getByTestId('new-user-enter-email');
    const secondEmail = getByTestId('new-user-confirm-email');

    fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
    fireEvent.change(secondEmail, { target: { value: '' } });

    await waitFor(() => {
      expect(queryByText('new-user-email-validate-confirm')).toBeFalsy();
      expect(secondEmail.classList.contains('invalid')).toBeFalsy();
    });
  });

  it('shows error when emails do not match', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <WrapNewUserEmailForm
          accountExistsReturnValue={false}
          invalidDomain={false}
        />
      );
    };

    const { getByTestId, queryByText } = subject();

    const firstEmail = getByTestId('new-user-enter-email');
    const secondEmail = getByTestId('new-user-confirm-email');
    fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
    fireEvent.change(secondEmail, {
      target: { value: 'not.the.same@email.com' },
    });
    fireEvent.blur(secondEmail);

    await waitFor(() => {
      expect(queryByText('new-user-email-validate-confirm')).toBeVisible();
    });
  });

  it('shows no error when emails match', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <WrapNewUserEmailForm
          accountExistsReturnValue={false}
          invalidDomain={false}
        />
      );
    };

    const { getByTestId, queryByText } = subject();
    const firstEmail = getByTestId('new-user-enter-email');
    const secondEmail = getByTestId('new-user-confirm-email');

    fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
    fireEvent.change(secondEmail, {
      target: { value: 'valid@email.com' },
    });
    fireEvent.blur(secondEmail);

    await waitFor(() => {
      expect(queryByText('new-user-email-validate-confirm')).toBeFalsy();
    });
  });

  it('Notifies the user if they already have an account', async () => {
    const checkAccountExists = (userAccount: string) =>
      Promise.resolve({ exists: true, invalidDomain: false });

    const result = await emailInputValidationAndAccountCheck(
      'foxy@mozilla.com',
      false,
      (state: string) => {},
      (value: boolean) => {},
      (value: boolean) => {},
      (value: string) => {},
      checkAccountExists,
      'example.com/signin',
      () => {},
      (id: string) => id
    );

    expect(result.value).toEqual('foxy@mozilla.com');
    expect(result.valid).toEqual(true);
    expect(result.error).toMatchObject(
      <Localized
        elems={{ a: <a href="example.com/signin">Sign in</a> }}
        id="new-user-already-has-account-sign-in"
      >
        <React.Fragment>
          You already have an account.{' '}
          <a data-testid="already-have-account-link" href="example.com/signin">
            Sign in
          </a>
        </React.Fragment>
      </Localized>
    );
  });

  it('Notifies the user if domain does not provide email', async () => {
    const checkAccountExists = (userAccount: string) =>
      Promise.resolve({ exists: false, invalidDomain: true });
    const result = await emailInputValidationAndAccountCheck(
      'foxy@mozilla.com',
      false,
      (state: string) => {},
      (value: boolean) => {},
      (value: boolean) => {},
      (value: string) => {},
      checkAccountExists,
      'example.com/signin',
      () => {},
      (id: string) => id
    );

    expect(result.value).toEqual('foxy@mozilla.com');
    expect(result.valid).toEqual(true);
    expect(result.error).toMatchObject(
      <Localized
        id="new-user-invalid-email-domain"
        vars={{ domain: 'mozilla.com' }}
      >
        <React.Fragment>
          Mistyped email? mozilla.com does not provide email.
        </React.Fragment>
      </Localized>
    );
  });
});

describe('checkAccountExists', () => {
  it('returns the response of apiFetchAccountStatus', async () => {
    const res = { exists: false };
    (apiFetchAccountStatus as jest.Mock).mockClear().mockResolvedValue(res);
    const actual = await checkAccountExists('testo@example.gg');
    expect(actual).toEqual(res);
    expect(apiFetchAccountStatus).toHaveBeenCalledTimes(1);
    expect(apiFetchAccountStatus).toHaveBeenCalledWith('testo@example.gg');
  });

  it('memoizes the response of for an email', async () => {
    (apiFetchAccountStatus as jest.Mock).mockClear();
    const email = `${Date.now()}@example.gg`;
    await checkAccountExists(email);
    await checkAccountExists(email);
    expect(apiFetchAccountStatus).toHaveBeenCalledTimes(1);
    expect(apiFetchAccountStatus).toHaveBeenCalledWith(email);
  });
});
