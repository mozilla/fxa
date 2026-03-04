/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import {
  AccountDeleteResponse,
  AccountDeleteTaskStatus,
} from 'fxa-admin-server/src/types';

export type AccountDeleteResult = {
  locator: string;
  taskName: string;
  status: string;
};

type TaskStatus = {
  taskName: string;
  status: string;
};

export const AccountDeleteResults = ({
  list,
}: {
  list: Array<AccountDeleteResult>;
}) => {
  const [taskStatuses, setTaskStatuses] = useState<AccountDeleteTaskStatus[]>(
    []
  );

  useEffect(() => {
    const taskNames = list.filter((x) => x.taskName).map((x) => x.taskName);
    if (taskNames.length === 0) return;

    const poll = async () => {
      try {
        const statuses = await adminApi.getDeleteStatus(taskNames);
        setTaskStatuses(statuses);
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [list]);

  const rows = list.map((row) => (
    <tr key={row.locator}>
      <td>{row.locator}</td>
      <td>
        {taskStatuses.find((x: TaskStatus) => row.taskName === x.taskName)
          ?.status || row.status}
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

      const apiResults: AccountDeleteResponse[] =
        await adminApi.deleteAccounts(list);
      setResults(
        apiResults.map((r) => ({
          locator: r.locator,
          taskName: r.taskName,
          status: r.status,
        }))
      );
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
        Provide a list of up to 1000 emails or UIDs separated by either a comma
        or newline in the textarea below. Then press 'Delete Accounts'. This
        will kick off the delete process and the status of each entry will be
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
