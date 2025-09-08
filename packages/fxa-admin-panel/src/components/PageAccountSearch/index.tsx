/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useLazyQuery, ApolloError } from '@apollo/client';
import Account from './Account';
import { Account as AccountType } from 'fxa-admin-server/src/graphql';
import iconSearch from '../../images/icon-search.svg';
import ErrorAlert from '../ErrorAlert';
import {
  GET_ACCOUNT_BY_EMAIL,
  GET_ACCOUNT_BY_UID,
  GET_EMAILS_LIKE,
  GET_ACCOUNT_BY_RECOVERY_PHONE,
  GET_RECOVERY_PHONES_LIKE,
} from './index.gql';

function validateUID(uid: string) {
  // checks if input string is in uid format (hex, 32 digit)
  return /^[0-9a-fA-F]{32}/.test(uid);
}

type SearchType = 'email' | 'uid' | 'recoveryPhone';

export const AccountSearch = () => {
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');

  // define two queries to search by either email or uid.
  const [getAccountByEmail, emailResults] = useLazyQuery(GET_ACCOUNT_BY_EMAIL);
  const [getAccountByUID, uidResults] = useLazyQuery(GET_ACCOUNT_BY_UID);
  const [getAccountByRecoveryPhone, recoveryPhoneResults] = useLazyQuery(
    GET_ACCOUNT_BY_RECOVERY_PHONE
  );
  // choose which query result to show based on type of query made
  const [searchType, setSearchType] = useState<SearchType | null>(null);
  const queryResults =
    searchType === 'email' && showResult
      ? emailResults
      : searchType === 'recoveryPhone' && showResult
        ? recoveryPhoneResults
        : uidResults;
  const [getEmailLike, { data: returnedEmails }] =
    useLazyQuery(GET_EMAILS_LIKE);
  const [getRecoveryPhonesLike, { data: returnedPhones }] = useLazyQuery(
    GET_RECOVERY_PHONES_LIKE
  );

  const handleSubmit = (event: React.FormEvent) => {
    const trimmedSearchInput = searchInput.trim();
    event.preventDefault();
    const isUID = validateUID(trimmedSearchInput);

    // choose correct query if email or uid
    if (isUID) {
      // uid and non-empty
      getAccountByUID({
        variables: { uid: trimmedSearchInput, autoCompleted: false },
      });
      setSearchType('uid');
      setShowResult(true);
    } else if (
      !isUID &&
      trimmedSearchInput.search('@') !== -1 &&
      trimmedSearchInput !== ''
    ) {
      // assume email if not uid and non-empty; must at least have '@'
      getAccountByEmail({
        variables: {
          email: trimmedSearchInput,
          autoCompleted: selectedSuggestion === trimmedSearchInput,
        },
      });
      setSearchType('email');
      setShowResult(true);
    } else if (/^\+?[1-9]\d{1,14}$/.test(trimmedSearchInput)) {
      // Check if input is a valid phone number
      getAccountByRecoveryPhone({
        variables: {
          phoneNumber: trimmedSearchInput,
          autoCompleted: selectedSuggestion === trimmedSearchInput,
        },
      });
      setSearchType('recoveryPhone');
      setShowResult(true);
    } else {
      window.alert('Invalid email, UID, or phone number format');
    }
  };

  const filteredEmailList: string[] =
    returnedEmails != null && showSuggestion
      ? returnedEmails.getEmailsLike.map(
          (item: { email: string }) => item.email
        )
      : [];

  const filteredPhoneList: string[] =
    returnedPhones && showSuggestion
      ? returnedPhones.getRecoveryPhonesLike.map(
          (item: { phoneNumber: string }) => item.phoneNumber
        )
      : [];

  const suggestions = [...filteredEmailList, ...filteredPhoneList];

  const onTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();

    if (value.length < 5) {
      setShowSuggestion(false);
    } else if (value.length >= 5) {
      getEmailLike({ variables: { search: value.trim() } });
      getRecoveryPhonesLike({ variables: { search: value.trim() } });
      setShowSuggestion(true);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    setShowSuggestion(true);
    onTextChanged(event);
  };

  const suggestionSelected = (value: string) => {
    setSearchInput(value);
    setSelectedSuggestion(value);
    setShowSuggestion(false);
  };

  const renderSuggestions = () => {
    return suggestions.map((item) => (
      <a
        key={item}
        className="p-2 border-b border-grey-100 block hover:bg-grey-10 focus:bg-grey-10 z-50"
        href="#suggestion"
        onClick={(e: any) => {
          e.preventDefault();
          suggestionSelected(item);
        }}
      >
        {item}
      </a>
    ));
  };

  return (
    <div data-testid="account-search">
      <h2 className="header-page">Account Search</h2>
      <p className="mb-1">
        Search for a Mozilla user account by email, recovery phone, or UID, and
        view its details, including: secondary emails, email bounces, time-based
        one-time passwords, recovery keys, and current session.
      </p>
      <p className="mb-1">
        Email addresses are blocked from the FxA email sender when an email sent
        to the address has bounced. Remove an email address from the blocked
        list by first searching for an account by email. Brief account
        information will be displayed as well as email bounces attached to the
        account. Delete the block on the email by deleting the bounced email
        data.
      </p>
      <p className="mb-1">
        <strong>NOTE:</strong> Searching by recovery phone requires the full
        phone number, including the country code, without any spaces, dashes, or
        parentheses (e.g., +12345678900).
      </p>

      <form
        onSubmit={handleSubmit}
        data-testid="search-form"
        className="mt-5 relative"
      >
        <label
          htmlFor="email"
          className="block uppercase text-sm text-grey-500"
        >
          Email, recovery phone, or UID to search for:
        </label>

        <div className="flex max-w-lg mt-2 relative">
          <input
            autoComplete="off"
            value={searchInput}
            autoFocus
            name="email"
            id="email"
            type="search"
            onChange={handleChange}
            placeholder="Email, recovery phone, or UID"
            data-testid="email-input"
            className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500"
          />
          <button
            className="bg-grey-100 px-3 rounded-r flex flex-row items-center"
            title="search"
            data-testid="search-button"
          >
            <img
              className="inline-flex w-4 h-auto"
              src={iconSearch}
              alt="search icon"
            />
          </button>
          {showSuggestion && suggestions.length > 0 && (
            <div
              className="suggestions-list absolute top-full w-full bg-white border border-grey-100 mt-3 shadow-sm rounded overflow-hidden z-50"
              data-testid="email-suggestions"
            >
              {renderSuggestions()}
            </div>
          )}
        </div>
      </form>

      {showResult && queryResults.refetch ? (
        <AccountSearchResult
          onCleared={queryResults.refetch}
          {...{
            loading: queryResults.loading,
            error: queryResults.error,
            data: queryResults.data,
            query: searchInput.trim(),
          }}
        />
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
  onCleared: () => void;
  loading: boolean;
  error?: ApolloError;
  data?: {
    accountByEmail: AccountType;
    accountByUid: AccountType;
    accountByRecoveryPhone: AccountType[];
  };
  query: string;
}) => {
  if (loading)
    return (
      <>
        <hr />
        <p data-testid="loading-message" className="mt-2">
          Loading...
        </p>
      </>
    );
  if (error) {
    return <ErrorAlert {...{ error }}></ErrorAlert>;
  }

  if (data?.accountByEmail) {
    return (
      <>
        <hr />
        <Account {...{ query, onCleared }} {...data.accountByEmail} />
      </>
    );
  }

  if (data?.accountByUid) {
    return (
      <>
        <hr />
        <Account {...{ query, onCleared }} {...data.accountByUid} />
      </>
    );
  }

  if (data?.accountByRecoveryPhone && data.accountByRecoveryPhone.length > 0) {
    if (data.accountByRecoveryPhone.length === 1) {
      return (
        <>
          <hr />
          <Account
            {...{ query, onCleared }}
            {...data.accountByRecoveryPhone[0]}
          />
        </>
      );
    }
    return (
      <>
        <hr />
        <p className="mb-1">
          {data.accountByRecoveryPhone.length} accounts found:
        </p>
        {data.accountByRecoveryPhone.map((account, index) => (
          <details
            key={account.uid}
            className="mb-2 border border-grey-100 rounded overflow-hidden"
          >
            <summary className="bg-grey-50 px-4 py-2 cursor-pointer hover:bg-grey-100">
              {`${index + 1}. ${account.email}`}
            </summary>
            <div className="px-4 bg-white">
              <Account {...{ query, onCleared }} {...account} />
            </div>
          </details>
        ))}
      </>
    );
  }

  return (
    <>
      <hr />
      <p data-testid="no-account-message">Account not found.</p>
    </>
  );
};

export default AccountSearch;
