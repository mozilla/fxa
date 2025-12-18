/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ACCOUNT_RESET_MUTATION, AccountResetResult } from './index.gql';

export const AccountResetResults = ({
  list,
}: {
  list: Array<AccountResetResult>;
}) => {
  const rows = list.map((row) => (
    <tr key={row.locator}>
      <td>{row.locator}</td>
      <td>{row.status}</td>
    </tr>
  ));

  return (
    <>
      <h3 className="header-page">Reset Results</h3>
      <table cellPadding={12}>
        <tr>
          <th>Account</th>
          <th>Status</th>
        </tr>
        {rows}
      </table>
    </>
  );
};

export const PageAccountReset = () => {
  const [inProgress, setInProgress] = useState(false);
  const [results, setResults] = useState<Array<AccountResetResult>>([]);
  const [resetAccountMutation] = useMutation(ACCOUNT_RESET_MUTATION);

  const saveButtonClass = () => {
    const base =
      'bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded';
    const active =
      'text-red-700 hover:text-red-700 hover:border-2 hover:border-grey-10 hover:bg-grey-50';
    const inactive = 'text-grey-700 cursor-not-allowed';
    return `${base} ${!inProgress ? active : inactive}`;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setInProgress(true);
    setResults([]);

    try {
      const formData = new FormData(e.currentTarget);
      const notificationEmail =
        formData.get('notificationEmail')?.toString() || '';
      const list = (formData.get('accountList') || '')
        .toString()
        .split(/\n|,/)
        .map((x) => x.trim())
        .filter((x) => x.length > 0);

      if (list.length > 1000) {
        alert('Enter fewer than 1000 emails or uids!');
        setResults([]);
        return;
      }

      const result = await resetAccountMutation({
        variables: {
          locators: list,
          notificationEmail,
        },
      });

      setResults(result.data?.resetAccounts || []);
    } finally {
      setInProgress(false);
    }
  };

  return (
    <>
      <h2 className="header-page">Reset Accounts</h2>
      <p>
        This page allows you to reset a user accounts.{' '}
        <b>
          Be careful! A user without recovery keys will lose data if you do
          this!
        </b>
      </p>
      <br />
      <p>
        Provide a list of up to 1000 emails or UIDs separated by either a comma
        or newline in the textarea below. Then press 'Delete Accounts'. This
        will kick off the delete process and the status of each entry will be
        displayed in the table below.
      </p>

      <form method="post" onSubmit={handleSubmit} className="mt-5 relative">
        <label>Notification email: </label>
        <input
          data-testid="notification-email-input"
          type="text"
          name="notificationEmail"
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          placeholder="Enter your email to be notified of end result!"
        />
        <br />
        <br />
        <textarea
          data-testid="account-list-input"
          name="accountList"
          rows={15}
          cols={60}
          className="border-2"
          placeholder="email1@mozilla.com,email2@mozilla.com"
        />
        <br />
        <br />
        <button
          type="submit"
          data-testid="account-reset-btn"
          className={saveButtonClass()}
          disabled={inProgress}
        >
          Reset Accounts
        </button>
      </form>
      <hr />
      {results.length > 0 && <AccountResetResults list={results} />}
    </>
  );
};

export default PageAccountReset;
