/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { IUserInfo, IPermission } from '../../../interfaces';

const styleClasses = {
  label: 'px-4 py-2',
  val: 'font-medium text-violet-900 px-4 py-2',
};

export const LabelValRow = ({
  label,
  val,
  testId,
}: {
  label: string;
  val: string;
  testId: string;
}) => (
  <tr key={testId}>
    <td className={styleClasses.label} data-testid={`${testId}-label`}>
      {label}
    </td>
    <td className={styleClasses.val} data-testid={`${testId}-val`}>
      {val}
    </td>
  </tr>
);

export const PermissionRow = ({
  id,
  permission,
}: {
  id: string;
  permission: IPermission;
}) => {
  const testId = `permissions-row-${id}`;
  return (
    <LabelValRow
      {...{
        testId,
        label: permission.name,
        val: permission.enabled ? '✓' : 'x',
      }}
    ></LabelValRow>
  );
};

export const PermissionsTable = ({
  permissions,
}: {
  permissions: Record<string, IPermission>;
}) => {
  return Object.keys(permissions).length === 0 ? (
    <></>
  ) : (
    <table className="table-auto" aria-label="permissions table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>Enabled</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(permissions).map((id: string) => (
          <PermissionRow key={id} {...{ id, permission: permissions[id] }} />
        ))}
      </tbody>
    </table>
  );
};

export const Permissions = ({ user }: { user: IUserInfo }) => {
  if (!user.permissions) {
    // Features and permissions TBD!
    user.permissions = {
      p1: { name: 'Permissions for Feature 1', enabled: true },
      p2: { name: 'Permissions for Feature 2', enabled: false },
    };
  }

  return (
    <div className="text-grey-600">
      <h2 className="text-lg font-semibold mb-2">Permissions</h2>
      <p className="mb-2">
        This page displays your current user, group, and associated permissions.
      </p>
      <table className="table-auto">
        <tbody>
          <LabelValRow
            {...{
              testId: 'permissions-user-email',
              label: 'Signed In As:',
              val: user.email,
            }}
          />
          <LabelValRow
            {...{
              testId: 'permissions-user-group',
              label: 'Your Group:',
              val: user.group,
            }}
          />
        </tbody>
      </table>
      <br />
      <PermissionsTable {...{ permissions: user.permissions }} />
    </div>
  );
};

export default Permissions;
