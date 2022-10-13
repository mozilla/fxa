import React, { useState } from 'react';
import { NewUserEmailForm } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'components/NewUserEmailForm',
  component: NewUserEmailForm,
} as Meta;

const WrapNewUserEmailForm = ({
  accountExistsReturnValue,
  invalidDomain,
}: {
  accountExistsReturnValue: boolean;
  invalidDomain: boolean;
}) => {
  const [, setValidEmail] = useState<string>('');
  const [, setAccountExists] = useState(false);
  const [, setInvalidEmailDomain] = useState(false);
  const [, setEmailsMatch] = useState(false);
  return (
    <div className="flex">
      <NewUserEmailForm
        signInURL={
          'https://localhost:3031/subscriptions/products/productId?plan=planId&signin=yes'
        }
        setValidEmail={setValidEmail}
        setAccountExists={setAccountExists}
        setInvalidEmailDomain={setInvalidEmailDomain}
        setEmailsMatch={setEmailsMatch}
        getString={(id: string) => id}
        checkAccountExists={() =>
          Promise.resolve({
            exists: accountExistsReturnValue,
            invalidDomain,
          })
        }
        selectedPlan={{}}
        onToggleNewsletterCheckbox={() => {}}
      />
    </div>
  );
};

const storyWithProps = ({
  accountExistsReturnValue = false,
  invalidDomain = false,
}: {
  accountExistsReturnValue?: boolean;
  invalidDomain?: boolean;
}) => {
  const story = () => (
    <WrapNewUserEmailForm
      accountExistsReturnValue={accountExistsReturnValue}
      invalidDomain={invalidDomain}
    />
  );

  return story;
};

export const Default = storyWithProps({});

export const ExistingAccount = storyWithProps({
  accountExistsReturnValue: true,
});

export const InvalidEmailDomain = storyWithProps({ invalidDomain: true });
