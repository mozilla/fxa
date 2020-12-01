/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import Account from './Account';
import './index.scss';

interface AccountType {
  uid: any;
  createdAt: number;
  emails: [
    {
      email: string;
      isVerified: boolean;
      isPrimary: boolean;
      createdAt: number;
    }
  ];
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
      createdAt
      emails {
        email
        isVerified
        isPrimary
        createdAt
      }
      emailBounces {
        email
        createdAt
        bounceType
        bounceSubType
      }
    }
  }
`;

export const AccountSearch = () => {
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
    <div className="account-search" data-testid="account-search">
      <h2>Account Search</h2>
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
          className="account-search-search-button"
          title="search"
          data-testid="search-button"
        ></button>
      </form>

      {showResult && refetch ? (
        <>
          <hr />
          <AccountSearchResult
            onCleared={refetch}
            {...{
              loading,
              error,
              data,
              query: inputValue,
            }}
          />
          <hr />
          <h2>Danger Zone</h2>
          <p>
            Please run these commands with caution, as some functions are
            irreversible.
          </p>
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
  query,
}: {
  onCleared: Function;
  loading: boolean;
  error?: {};
  data?: {
    accountByEmail: AccountType;
  };
  query: string;
}) => {
  if (loading) return <p data-testid="loading-message">Loading...</p>;
  if (error) return <p data-testid="error-message">An error occured.</p>;

  if (data?.accountByEmail) {
    return <Account {...{ query, onCleared }} {...data.accountByEmail} />;
  }
  return <p data-testid="no-account-message">Account not found.</p>;
};

export default AccountSearch;
