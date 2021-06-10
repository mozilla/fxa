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
      verified: boolean;
      createdAt: number;
      name: string;
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
        createdAt
        name
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

// new query for getting account by UID
export const GET_ACCOUNT_BY_UID = gql`
  query getAccountByUid($uid: String!) {
    accountByUid(uid: $uid) {
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
        createdAt
        name
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

function validateUID(uid: string) {
  // checks if input string is in uid format (hex, 32 digit)
  return /^[0-9a-fA-F]{32}/.test(uid);
}

export const GET_EMAILS_LIKE = gql`
  query getEmails($search: String!) {
    getEmailsLike(search: $search) {
      email
    }
  }
`;

export const AccountSearch = () => {
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  // define two queries to search by either email or uid.
  const [getAccountbyEmail, emailResults] = useLazyQuery(GET_ACCOUNT_BY_EMAIL);
  const [getAccountbyUID, uidResults] = useLazyQuery(GET_ACCOUNT_BY_UID);
  // choose which query result to show based on type of query made
  const [isEmail, setIsEmail] = useState<boolean>(false);
  const queryResults = isEmail && showResult ? emailResults : uidResults;
  const [getEmailLike, { data: returnedEmails }] =
    useLazyQuery(GET_EMAILS_LIKE);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const isUID = validateUID(searchInput);
    // choose correct query if email or uid
    if (isUID) {
      // uid and non-empty
      getAccountbyUID({ variables: { uid: searchInput } });
      setIsEmail(false);
      setShowResult(true);
    } else if (!isUID && searchInput.search('@') !== -1 && searchInput !== '') {
      // assume email if not uid and non-empty; must at least have '@'
      getAccountbyEmail({ variables: { email: searchInput } });
      setIsEmail(true);
      setShowResult(true);
    }
    // invalid input, neither email nor uid
    else {
      window.alert('Invalid email or UID format');
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
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

    if (value.length < 5) {
      setShowSuggestion(false);
    } else if (value.length >= 5) {
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
        Search for a Firefox user account by email or UID and view its details,
        including: secondary emails, email bounces, time-based one-time
        passwords, recovery keys, and current session.
      </p>
      <p>
        Email addresses are blocked from the FxA email sender when an email sent
        to the address has bounced. Remove an email address from the blocked
        list by first searching for an account by email. Brief account
        information will be displayed as well as email bounces attached to the
        account. Delete the block on the email by deleting the bounced email
        data.
      </p>
      <form onSubmit={handleSubmit} data-testid="search-form" className="flex">
        <label htmlFor="email">Email or UID to search for:</label>
        <br />
        <input
          autoComplete="off"
          value={searchInput}
          autoFocus
          name="email"
          type="search"
          onChange={handleChange}
          placeholder="hello@world.com or UID"
          data-testid="email-input"
        />
        <div className="suggestions-list">{renderSuggestions()}</div>
        <button
          className="account-search-search-button"
          title="search"
          data-testid="search-button"
        ></button>
      </form>

      {showResult && queryResults.refetch ? (
        <>
          <hr />
          <AccountSearchResult
            onCleared={queryResults.refetch}
            {...{
              loading: queryResults.loading,
              error: queryResults.error,
              data: queryResults.data,
              query: searchInput,
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
    accountByUid: AccountType;
  };
  query: string;
}) => {
  if (loading) return <p data-testid="loading-message">Loading...</p>;
  if (error) return <p data-testid="error-message">An error occurred.</p>;

  if (data?.accountByEmail) {
    return <Account {...{ query, onCleared }} {...data.accountByEmail} />;
  }

  if (data?.accountByUid) {
    return <Account {...{ query, onCleared }} {...data.accountByUid} />;
  }
  return <p data-testid="no-account-message">Account not found.</p>;
};

export default AccountSearch;
