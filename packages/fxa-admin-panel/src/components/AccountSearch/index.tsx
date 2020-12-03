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
  totp: [
    {
      verified: boolean;
      createdAt: number;
      enabled: boolean;
    }
  ];
  recoveryKeys: [
    {
      createdAt: number;
      verifiedAt: number;
      enabled: boolean;
    }
  ];
  sessionTokens: [
    {
      tokenId: string;
      tokenData: string;
      uid: string;
      createdAt: number;
      uaBrowser: string;
      uaBrowserVersion: string;
      uaOS: string;
      uaOSVersion: string;
      uaDeviceType: string;
      lastAccessTime: number;
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
      totp {
        verified
        createdAt
        enabled
      }
      recoveryKeys {
        createdAt
        verifiedAt
        enabled
      }
      sessionTokens {
        tokenId
        tokenData
        uid
        createdAt
        uaBrowser
        uaBrowserVersion
        uaOS
        uaOSVersion
        uaDeviceType
        lastAccessTime
      }
    }
  }
`;

export const AccountSearch = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showResult, setShowResult] = useState<Boolean>(false);
  const [suggestions, setSuggestion] = useState<Array<String>>([]);
  const [text, setText] = useState<String>('');
  const [getAccount, { loading, error, data, refetch }] = useLazyQuery(
    GET_ACCOUNT_BY_EMAIL
  );

  const items = [
    'test@yahoo.com',
    '1234@gmail.com',
    'hello@hello.com',
    'test@gmail.com',
  ];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    getAccount({ variables: { email: inputValue } });
    // Don't hide after the first result is shown
    setShowResult(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setSuggestion([]);
    onTextChanged(event);
  };

  const onTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    let suggestions = [];
    if (value.length > 1) {
      const regex = new RegExp(`^${value}`, 'i');
      suggestions = items.sort().filter((v) => regex.test(v));
    }
    setSuggestion(suggestions);
    setText(event.target.value);
  };

  const renderSuggestions = () => {
    if (suggestions.length === 0) {
      return null;
    }
    return (
      <ul>
        {suggestions.map((item) => (
          <li onClick={() => suggestionSelected(item)}>{item}</li>
        ))}
      </ul>
    );
  };

  const suggestionSelected = (value) => {
    setText(value);
    setSuggestion([]);
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
          autoComplete="off"
          name="email"
          type="email"
          onChange={handleChange}
          placeholder="hello@world.com"
          data-testid="email-input"
        />
        <div className="suggestions-list">{renderSuggestions()}</div>
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
