import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { NewUserEmailForm } from './index';

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
    <div style={{ display: 'flex' }}>
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

storiesOf('components/NewUserEmailForm', module)
  .add('default', () => (
    <WrapNewUserEmailForm
      accountExistsReturnValue={false}
      invalidDomain={false}
    />
  ))
  .add('existing account', () => (
    <WrapNewUserEmailForm
      accountExistsReturnValue={true}
      invalidDomain={false}
    />
  ))
  .add('invalid email domain', () => (
    <WrapNewUserEmailForm
      accountExistsReturnValue={false}
      invalidDomain={true}
    />
  ));
