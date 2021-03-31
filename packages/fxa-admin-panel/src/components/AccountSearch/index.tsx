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
  disabledAt: number | null;
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
  securityEvents: [
    {
      uid: string;
      nameId: number;
      verified: boolean;
      ipAddrHmac: string;
      createdAt: number;
      tokenVerificationId: string;
      name: string;
    }
  ];
}

export const GET_ACCOUNT_BY_EMAIL = gql`
  query getAccountByEmail($email: String!) {
    accountByEmail(email: $email) {
      uid
      createdAt
      disabledAt
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
      securityEvents {
        uid
        nameId
        verified
        ipAddrHmac
        createdAt
        tokenVerificationId
        name
      }
    }
  }
`;

export const GET_EMAILS_LIKE = gql`
  query getEmails($search: String!) {
    getEmailsLike(search: $search) {
      email
    }
  }
`;

export const AccountSearch = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [getAccount, { loading, error, data, refetch }] = useLazyQuery(
    GET_ACCOUNT_BY_EMAIL
  );
  const [getEmailLike, { data: returnedEmails }] = useLazyQuery(
    GET_EMAILS_LIKE
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowSuggestion(false);
    getAccount({ variables: { email: searchInput } });
    // Don't hide after the first result is shown
    setShowResult(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setShowSuggestion(true);
    onTextChanged(event);
  };

  let filteredList: string[] = [];
  if (returnedEmails != null && showSuggestion) {
    for (let i = 0; i < returnedEmails.getEmailsLike.length; i++) {
      filteredList[i] = returnedEmails.getEmailsLike[i].email;
    }
  }

  const onTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSearchInput(value);

    if (value.length < 3) {
      setShowSuggestion(false);
    } else if (value.length >= 3) {
      getEmailLike({ variables: { search: value } });
      setShowSuggestion(true);
    }
  };

  const renderSuggestions = () => {
    if (filteredList.length === 0 || searchInput.length < 5) {
      return null;
    }
    return (
      <ul>
        {filteredList.map((item) => (
          <li onClick={() => suggestionSelected(item)}>{item}</li>
        ))}
      </ul>
    );
  };

  const suggestionSelected = (value: string) => {
    setSearchInput(value);
    setShowSuggestion(false);
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
          autoComplete="off"
          value={searchInput}
          autoFocus
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
