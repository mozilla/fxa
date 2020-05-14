/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useLazyQuery } from 'react-apollo';
import Account from './Account';
import './index.scss';

interface AccountType {
  uid: any;
  email: string;
  createdAt: number;
  emailVerified: boolean;
  emailBounces: [
    {
      email: string;
      createdAt: number;
      bounceType: string;
      bounceSubType: string;
    }
  ];
}

export const GET_ACCOUNT_BY_EMAIL = gql`
  query getAccountByEmail($email: String!) {
    accountByEmail(email: $email) {
      uid
      email
      createdAt
      emailVerified
      emailBounces {
        email
        createdAt
        bounceType
        bounceSubType
      }
    }
  }
`;

export const EmailBlocks = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showResult, setShowResult] = useState<Boolean>(false);
  const [getAccount, { loading, error, data, refetch }] = useLazyQuery(
    GET_ACCOUNT_BY_EMAIL
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    getAccount({ variables: { email: inputValue } });
    // Don't hide after the first result is shown
    setShowResult(true);
  };

  return (
    <div className="email-blocks" data-testid="email-blocks">
      <h2>Find and Delete Email Blocks</h2>
      <p>
        Email addresses are blocked from the FxA email sender when an email sent
        to the address has bounced.
      </p>
      <p>
        Remove an email address from the blocked list by first searching for an
        account by email. Brief account information will be displayed as well as
        email bounces attached to the account. Delete the block on the email by
        deleting the bounced email data.
      </p>

      <form onSubmit={handleSubmit} data-testid="search-form" className="flex">
        <label htmlFor="email">Email to search for:</label>
        <br />
        <input
          autoFocus
          name="email"
          type="email"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(event.target.value)
          }
          placeholder="hello@world.com"
          data-testid="email-input"
        />
        <button
          className="email-blocks-search-button"
          title="search"
          data-testid="search-button"
        ></button>
      </form>

      {showResult ? (
        <>
          <hr />
          <AccountSearchResult
            onCleared={refetch}
            {...{
              loading,
              error,
              data,
            }}
          />
        </>
      ) : null}
    </div>
  );
};

const AccountSearchResult = ({
  onCleared,
  loading,
  error,
  data,
}: {
  onCleared: Function;
  loading: boolean;
  error?: {};
  data?: {
    accountByEmail: AccountType;
  };
}) => {
  if (loading) return <p data-testid="loading-message">Loading...</p>;
  if (error) return <p data-testid="error-message">An error occured.</p>;

  if (data?.accountByEmail) {
    return <Account onCleared={onCleared} {...data.accountByEmail} />;
  }
  return <p data-testid="no-account-message">Account not found.</p>;
};

export default EmailBlocks;
