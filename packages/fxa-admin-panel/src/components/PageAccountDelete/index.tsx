/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import {
  ACCOUNT_DELETE_MUTATION,
  ACCOUNT_DELETE_TASK_STATUS_QUERY,
  AccountDeleteResult,
  TaskStatus,
} from './index.gql';

export const AccountDeleteResults = ({
  list,
}: {
  list: Array<AccountDeleteResult>;
}) => {
  const statusResult = useQuery(ACCOUNT_DELETE_TASK_STATUS_QUERY, {
    variables: {
      taskNames: list.filter((x) => x.taskName).map((x) => x.taskName),
    },
    pollInterval: 5000,
  });

  if (statusResult.loading) {
    return <>Loading...</>;
  }

  const rows = list.map((row) => (
    <tr>
      <td>{row.locator}</td>
      <td>
        {statusResult.data?.getDeleteStatus?.find(
          (x: TaskStatus) => row.taskName === x.taskName
        )?.status || row.status}
      </td>
    </tr>
  ));

  return (
    <>
      <table cellPadding={12}>
        <tr>
          <th>Account</th>
          <th>Current Status</th>
        </tr>
        {rows}
      </table>
    </>
  );
};

export const PageAccountDelete = () => {
  const [inProgress, setInProgress] = useState(false);
  const [results, setResults] = useState<Array<AccountDeleteResult>>([]);
  const [deleteAccountMutation] = useMutation(ACCOUNT_DELETE_MUTATION);

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
      const formJson = Object.fromEntries(formData.entries());
      const list = formJson.accountList
        .toString()
        .split(/\n|,/)
        .map((x) => x.trim())
        .filter((x) => x.length > 0);

      if (list.length > 1000) {
        alert('Enter fewer than 1000 emails or uids!');
        setResults([]);
        return;
      }

      const result = await deleteAccountMutation({
        variables: { locators: list },
      });
      setResults(result.data?.deleteAccounts || []);
    } finally {
      setInProgress(false);
    }
  };

  return (
    <>
      <h2 className="header-page">Delete Accounts</h2>
      <p>
        This page allows you to delete user accounts.{' '}
        <b>Be careful! Data will be lost through this action!</b>
      </p>
      <br />
      <p>
        Provide a list of up to 1000 emails or UIDs separated by either a coma
        or newline in the textarea below. Then press 'Delete Accounts'. This
        will kick off the delete process, and the status of each entry will be
        displayed in the table below.
      </p>

      <form method="post" onSubmit={handleSubmit}>
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
          data-testid="account-delete-btn"
          className={saveButtonClass()}
          disabled={inProgress}
        >
          Delete Accounts
        </button>
      </form>
      <hr />
      {results.length > 0 && <AccountDeleteResults list={results} />}
    </>
  );
};

export default PageAccountDelete;
