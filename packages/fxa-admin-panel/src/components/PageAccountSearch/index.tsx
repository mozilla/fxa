/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback } from 'react';
import Account from './Account';
import { Account as AccountType } from 'fxa-admin-server/src/types';
import iconSearch from '../../images/icon-search.svg';
import ErrorAlert from '../ErrorAlert';
import { adminApi } from '../../lib/api';

function validateUID(uid: string) {
  // checks if input string is in uid format (hex, 32 digit)
  return /^[0-9a-fA-F]{32}/.test(uid);
}

type SearchType = 'email' | 'uid' | 'recoveryPhone';

type SearchData = {
  accountByEmail?: AccountType[];
  accountByUid?: AccountType | null;
  accountByRecoveryPhone?: AccountType[];
};

/**
 * Describes how a searched address relates to an account, so support can
 * tell apart an account that currently holds the address from one that
 * only had it as its sign-up email before it was removed and reused.
 */
export function emailMatchLabel(
  account: Pick<AccountType, 'emails'>,
  query: string
):
  | 'Primary email'
  | 'Secondary email'
  | 'Sign-up email (no longer on account)' {
  const normalized = query.trim().toLowerCase();
  const match = account.emails.find(
    (e) => e.email.toLowerCase() === normalized
  );
  if (match) {
    return match.isPrimary ? 'Primary email' : 'Secondary email';
  }
  return 'Sign-up email (no longer on account)';
}

export const AccountSearch = () => {
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [searchType, setSearchType] = useState<SearchType | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  // Search result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [searchData, setSearchData] = useState<SearchData | undefined>();

  // Autocomplete state
  const [returnedEmails, setReturnedEmails] = useState<{ email: string }[]>([]);
  const [returnedPhones, setReturnedPhones] = useState<
    { phoneNumber: string }[]
  >([]);

  const runSearch = useCallback(
    async (query: string, type: SearchType, autoCompleted: boolean) => {
      setLoading(true);
      setError(undefined);
      try {
        if (type === 'uid') {
          const account = await adminApi.getAccountByUid(query);
          setSearchData({ accountByUid: account });
        } else if (type === 'email') {
          const accounts = await adminApi.getAccountByEmail(
            query,
            autoCompleted
          );
          setSearchData({ accountByEmail: accounts });
        } else if (type === 'recoveryPhone') {
          const accounts = await adminApi.getAccountByPhone(
            query,
            autoCompleted
          );
          setSearchData({ accountByRecoveryPhone: accounts });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const onCleared = useCallback(() => {
    if (searchType && lastQuery) {
      runSearch(lastQuery, searchType, false);
    }
  }, [searchType, lastQuery, runSearch]);

  const handleSubmit = (event: React.FormEvent) => {
    const trimmedSearchInput = searchInput.trim();
    event.preventDefault();
    const isUID = validateUID(trimmedSearchInput);

    let type: SearchType;
    let query: string;
    let autoCompleted: boolean;

    if (isUID) {
      type = 'uid';
      query = trimmedSearchInput;
      autoCompleted = false;
    } else if (
      !isUID &&
      trimmedSearchInput.search('@') !== -1 &&
      trimmedSearchInput !== ''
    ) {
      type = 'email';
      query = trimmedSearchInput;
      autoCompleted = selectedSuggestion === trimmedSearchInput;
    } else if (/^\+?[1-9]\d{1,14}$/.test(trimmedSearchInput)) {
      type = 'recoveryPhone';
      query = trimmedSearchInput;
      autoCompleted = selectedSuggestion === trimmedSearchInput;
    } else {
      window.alert('Invalid email, UID, or phone number format');
      return;
    }

    setSearchType(type);
    setLastQuery(query);
    setShowResult(true);
    runSearch(query, type, autoCompleted);
  };

  const filteredEmailList: string[] =
    returnedEmails != null && showSuggestion
      ? returnedEmails.map((item) => item.email)
      : [];

  const filteredPhoneList: string[] =
    returnedPhones && showSuggestion
      ? returnedPhones.map((item) => item.phoneNumber)
      : [];

  const suggestions = [...filteredEmailList, ...filteredPhoneList];

  const onTextChanged = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();

    if (value.length < 5) {
      setShowSuggestion(false);
      setReturnedEmails([]);
      setReturnedPhones([]);
    } else {
      setShowSuggestion(true);
      try {
        const [emails, phones] = await Promise.all([
          adminApi.getEmailsLike(value),
          adminApi.getPhonesLike(value),
        ]);
        setReturnedEmails(emails);
        setReturnedPhones(phones);
      } catch {}
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

      {showResult ? (
        <AccountSearchResult
          onCleared={onCleared}
          {...{
            loading,
            error,
            data: searchData,
            query: lastQuery,
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
  error?: Error;
  data?: SearchData;
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

  if (data?.accountByUid) {
    return (
      <>
        <hr />
        <Account {...{ query, onCleared }} {...data.accountByUid} />
      </>
    );
  }

  const accounts = data?.accountByEmail ?? data?.accountByRecoveryPhone ?? [];
  const isEmailSearch = !!data?.accountByEmail;
  const matchChip = (account: AccountType) => (
    <span
      data-testid="email-match-label"
      className="ml-2 px-2 py-0.5 rounded-full text-xs bg-grey-100 text-grey-600"
    >
      {emailMatchLabel(account, query)}
    </span>
  );

  if (accounts.length === 1) {
    return (
      <>
        <hr />
        {isEmailSearch && (
          <p className="mb-1">Matched by{matchChip(accounts[0])}</p>
        )}
        <Account {...{ query, onCleared }} {...accounts[0]} />
      </>
    );
  }

  if (accounts.length > 1) {
    return (
      <>
        <hr />
        <p className="mb-1">{accounts.length} accounts found:</p>
        {accounts.map((account, index) => (
          <details
            key={account.uid}
            className="mb-2 border border-grey-100 rounded overflow-hidden"
          >
            <summary className="bg-grey-50 px-4 py-2 cursor-pointer hover:bg-grey-100">
              {`${index + 1}. ${account.email}`}
              {isEmailSearch && matchChip(account)}
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
