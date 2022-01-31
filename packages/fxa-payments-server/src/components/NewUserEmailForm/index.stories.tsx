import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { NewUserEmailForm } from './index';

const WrapNewUserEmailForm = ({
  accountExistsReturnValue,
}: {
  accountExistsReturnValue: boolean;
}) => {
  const [validEmail, setValidEmail] = useState<string>('');
  const [accountExists, setAccountExists] = useState(false);
  const [emailsMatch, setEmailsMatch] = useState(false);
  return (
    <div style={{ display: 'flex' }}>
      <NewUserEmailForm
        signInURL={
          'https://localhost:3031/subscriptions/products/productId?plan=planId&signin=yes'
        }
        setValidEmail={setValidEmail}
        setAccountExists={setAccountExists}
        setEmailsMatch={setEmailsMatch}
        getString={(id: string) => id}
        checkAccountExists={() => Promise.resolve(accountExistsReturnValue)}
        selectedPlan={{}}
        onToggleNewsletterCheckbox={() => {}}
      />
    </div>
  );
};

storiesOf('components/NewUserEmailForm', module)
  .add('default', () => (
    <WrapNewUserEmailForm accountExistsReturnValue={false} />
  ))
  .add('existing account', () => (
    <WrapNewUserEmailForm accountExistsReturnValue={true} />
  ));
