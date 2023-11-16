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
  newsletterLabelTextCode,
}: {
  accountExistsReturnValue: boolean;
  invalidDomain: boolean;
  newsletterLabelTextCode?: string;
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
        selectedPlan={{
          product_metadata: {
            newsletterLabelTextCode,
          },
        }}
        onToggleNewsletterCheckbox={() => {}}
      />
    </div>
  );
};

const storyWithContext = (
  accountExistsReturnValue: boolean,
  invalidDomain: boolean,
  storyName?: string,
  newsletterLabelTextCode?: string
) => {
  const story = () => (
    <WrapNewUserEmailForm
      accountExistsReturnValue={accountExistsReturnValue}
      invalidDomain={invalidDomain}
      newsletterLabelTextCode={newsletterLabelTextCode}
    />
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext(false, false, 'default');

export const SnPNewsletterCopy = storyWithContext(
  false,
  false,
  'default - with S&P newsletter copy',
  'snp'
);

export const HubsNewsletterCopy = storyWithContext(
  false,
  false,
  'default - with Hubs newsletter copy',
  'hubs'
);

export const MDNNewsletterCopy = storyWithContext(
  false,
  false,
  'default - with MDN Plus newsletter copy',
  'mdnplus'
);

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
