import React from 'react';
import {
  act,
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {
  NewUserEmailForm,
  emailInputValidationAndAccountCheck,
  checkAccountExists,
} from './index';

describe('NewUserEmailForm test', () => {
  it('renders as expected', () => {
    let subject;
    act(() => {
      subject = render(
        <NewUserEmailForm
          getString={(id: string) => id}
          checkAccountExists={() => Promise.resolve({ exists: false })}
        />
      );
    });
    const form = subject.queryByTestId('new-user-email-form');
    expect(form).toBeInTheDocument();

    const signInCopy = subject.queryByTestId('sign-in-copy');
    expect(signInCopy).toBeInTheDocument();

    const firstEmail = subject.queryByTestId('new-user-email');
    expect(firstEmail).toBeInTheDocument();

    const secondEmail = subject.queryByTestId('new-user-confirm-email');
    expect(secondEmail).toBeInTheDocument();

    const subscribeCheckbox = subject.queryByTestId(
      'new-user-subscribe-product-updates'
    );
    expect(subscribeCheckbox).toBeInTheDocument();

    const assuranceCopy = subject.queryByTestId('assurance-copy');
    expect(assuranceCopy).toBeInTheDocument();
  });

  it('shows error when invalid email is input to first field', async () => {
    let subject;
    await act(async () => {
      subject = render(
        <NewUserEmailForm
          getString={(id: string) => id}
          checkAccountExists={() => Promise.resolve({ exists: false })}
        />
      );
      const firstEmail = subject.getByTestId('new-user-email');

      fireEvent.change(firstEmail, { target: { value: 'invalid-email' } });
      fireEvent.blur(firstEmail);
    });
    expect(subject.queryByText('new-user-email-validate')).toBeVisible();
  });

  it('shows no error when valid email is input to first field', async () => {
    let subject;

    await act(async () => {
      subject = render(
        <NewUserEmailForm
          getString={(id: string) => id}
          checkAccountExists={() => Promise.resolve({ exists: false })}
        />
      );
      const firstEmail = subject.getByTestId('new-user-email');
      fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
      fireEvent.blur(firstEmail);
    });

    expect(subject.queryByText('new-user-email-validate')).toBeFalsy();
  });

  it('shows error when emails do not match', async () => {
    let subject;
    await act(async () => {
      subject = render(
        <NewUserEmailForm
          getString={(id: string) => id}
          checkAccountExists={() => Promise.resolve({ exists: false })}
        />
      );
      const firstEmail = subject.getByTestId('new-user-email');
      const secondEmail = subject.getByTestId('new-user-confirm-email');
      fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
      fireEvent.change(secondEmail, {
        target: { value: 'not.the.same@email.com' },
      });
      fireEvent.blur(secondEmail);
    });
    expect(
      subject.queryByText('new-user-email-validate-confirm')
    ).toBeVisible();
  });

  it('shows no error when emails match', async () => {
    let subject;
    await act(async () => {
      subject = render(
        <NewUserEmailForm
          getString={(id: string) => id}
          checkAccountExists={() => Promise.resolve({ exists: false })}
        />
      );
      const firstEmail = subject.getByTestId('new-user-email');
      const secondEmail = subject.getByTestId('new-user-confirm-email');

      fireEvent.change(firstEmail, { target: { value: 'valid@email.com' } });
      fireEvent.blur(firstEmail);
      fireEvent.change(secondEmail, { target: { value: 'valid@email.com' } });
      fireEvent.blur(secondEmail);
    });
    waitForElementToBeRemoved(
      subject.queryByText('new-user-email-validate-confirm')
    ).then(() => {
      expect(
        subject.queryByText('new-user-email-validate-confirm')
      ).toBeFalsy();
    });
  });

  it('Notifies the user if they already have an account', async () => {
    const checkAccountExists = (userAccount: string) =>
      Promise.resolve({ exists: true });

    emailInputValidationAndAccountCheck(
      'foxy@mozilla.com',
      false,
      (state: string) => state,
      (id: string) => id,
      checkAccountExists
    ).then((result) => {
      expect(result).toEqual({
        value: 'foxy@mozilla.com',
        valid: true,
        error: 'new-user-existing-account-sign-in',
      });
    });
  });
});
