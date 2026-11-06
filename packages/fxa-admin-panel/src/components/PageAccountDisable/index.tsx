/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { adminApi } from '../../lib/api';
import {
  AccountDisableResponse,
  AccountDisableStatus,
} from 'fxa-admin-server/src/types';

// The server accepts at most 1000 locators per request, and a JSON body of at most 100 KiB.
const BATCH_SIZE = 1000;
const MAX_BODY_BYTES = 90_000;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

const byteLength = (s: string) => new TextEncoder().encode(s).length;

const toBatches = (list: string[]) => {
  const emptyBody = byteLength(JSON.stringify({ locators: [] }));
  const batches: string[][] = [];
  let batch: string[] = [];
  let bytes = emptyBody;
  for (const locator of list) {
    // One byte more than needed for the first entry, for the comma.
    const size = byteLength(JSON.stringify(locator)) + 1;
    if (
      batch.length === BATCH_SIZE ||
      (batch.length > 0 && bytes + size > MAX_BODY_BYTES)
    ) {
      batches.push(batch);
      batch = [];
      bytes = emptyBody;
    }
    batch.push(locator);
    bytes += size;
  }
  if (batch.length > 0) {
    batches.push(batch);
  }
  return batches;
};

const accounts = (n: number) => `${n} account${n === 1 ? '' : 's'}`;

export const AccountDisableResults = ({
  list,
}: {
  list: Array<AccountDisableResponse>;
}) => {
  const count = (status: AccountDisableStatus) =>
    list.filter((row) => row.status === status).length;

  return (
    <>
      <h3 className="header-page">Disable Results</h3>
      <p role="status">
        {accounts(count(AccountDisableStatus.Success))} disabled,{' '}
        {count(AccountDisableStatus.Failure)} failed,{' '}
        {accounts(count(AccountDisableStatus.NoAccount))} not found
      </p>
    </>
  );
};

export const PageAccountDisable = () => {
  const [inProgress, setInProgress] = useState(false);
  const [results, setResults] = useState<Array<AccountDisableResponse>>([]);
  const [error, setError] = useState('');

  const buttonClass = `bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded ${
    inProgress
      ? 'text-grey-700 cursor-not-allowed'
      : 'text-red-700 hover:text-red-700 hover:border-2 hover:border-grey-10 hover:bg-grey-50'
  }`;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = (form.elements.namedItem('accountFile') as HTMLInputElement)
      .files?.[0];
    if (file && file.size > MAX_FILE_BYTES) {
      alert('Choose a file of 15MB or less!');
      return;
    }

    setInProgress(true);
    setResults([]);
    setError('');

    try {
      let fileText = '';
      if (file?.size) {
        try {
          fileText = await file.text();
        } catch (err) {
          setError(
            `Could not read the file, no entries were submitted: ${err}`
          );
          return;
        }
      }
      const list = `${formData.get('accountList') || ''}\n${fileText}`
        .split(/\n|,/)
        .map((x) => x.trim())
        .filter((x) => x.length > 0);

      let start = 0;
      for (const batch of toBatches(list)) {
        try {
          const batchResults = await adminApi.disableAccounts(batch);
          setResults((prev) => [...prev, ...batchResults]);
          start += batch.length;
        } catch (err) {
          // The server can finish a batch that the client gets no reply for.
          const end = start + batch.length;
          const notSent =
            end < list.length ? ' Later entries were not submitted.' : '';
          setError(
            `The request for entries ${start + 1} to ${end} of ${list.length} failed, so their outcome is unknown.${notSent} ${err}`
          );
          return;
        }
      }
    } finally {
      setInProgress(false);
    }
  };

  return (
    <>
      <h2 className="header-page">Disable Accounts</h2>
      <p>
        This page allows you to disable user accounts. A disabled account cannot
        sign in, and its sessions, refresh tokens and authorization codes are
        revoked. Its OAuth access tokens stay valid until they expire. The user
        does not get an email.
      </p>
      <br />
      <p>
        Provide emails or UIDs separated by either a comma or newline in the
        textarea below, or choose a text file of up to 15MB. Then press 'Disable
        Accounts'. A summary of the results will be displayed below.
      </p>

      <form method="post" onSubmit={handleSubmit} className="mt-5 relative">
        <textarea
          aria-label="Emails or UIDs"
          data-testid="account-list-input"
          name="accountList"
          rows={15}
          cols={60}
          className="border-2"
          placeholder="email1@mozilla.com,email2@mozilla.com"
        />
        <br />
        <br />
        <label htmlFor="account-file">Text file: </label>
        <input
          id="account-file"
          data-testid="account-file-input"
          type="file"
          name="accountFile"
          accept=".txt,.csv,text/plain"
        />
        <br />
        <br />
        <button
          type="submit"
          data-testid="account-disable-btn"
          className={buttonClass}
          disabled={inProgress}
        >
          Disable Accounts
        </button>
      </form>
      <hr />
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {results.length > 0 && <AccountDisableResults list={results} />}
    </>
  );
};

export default PageAccountDisable;
