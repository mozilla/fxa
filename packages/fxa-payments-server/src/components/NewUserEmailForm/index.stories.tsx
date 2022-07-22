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

const storyWithContext = (
  accountExistsReturnValue: boolean,
  invalidDomain: boolean,
  storyName?: string
) => {
  const story = () => (
    <WrapNewUserEmailForm
      accountExistsReturnValue={accountExistsReturnValue}
      invalidDomain={invalidDomain}
    />
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext(false, false, 'default');

export const ExistingAccount = storyWithContext(
  true,
  false,
  'existing account'
);

export const InvalidEmailDomain = storyWithContext(
  false,
  true,
  'invalid email domain'
);
