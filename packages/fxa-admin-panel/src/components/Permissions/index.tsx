/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { IFeatureFlag } from 'fxa-shared/guards';
import { useUserContext } from '../../hooks/UserContext';
import { useGuardContext } from '../../hooks/GuardContext';

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

export const PermissionRow = ({ flag }: { flag: IFeatureFlag }) => {
  const testId = `permissions-row-${flag.id}`;
  return (
    <LabelValRow
      {...{
        testId,
        label: flag.name,
        val: flag.enabled ? '✅' : '❌',
      }}
    ></LabelValRow>
  );
};

export const PermissionsTable = ({
  featureFlags,
}: {
  featureFlags: IFeatureFlag[];
}) => {
  return featureFlags.length === 0 ? (
    <></>
  ) : (
    <table className="table-auto" aria-label="permissions table">
      <thead>
        <tr>
          <th className="text-left pl-4">Feature</th>
          <th>Enabled</th>
        </tr>
      </thead>
      <tbody>
        {featureFlags.map((flag) => {
          return <PermissionRow key={flag.id} {...{ flag }} />;
        })}
      </tbody>
    </table>
  );
};

export const Permissions = () => {
  const { user } = useUserContext();
  const { guard } = useGuardContext();

  const featureFlags: IFeatureFlag[] = guard.getFeatureFlags(user.group);

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
              val: user.group.name,
            }}
          />
        </tbody>
      </table>
      <br />
      <PermissionsTable {...{ featureFlags }} />
    </div>
  );
};

export default Permissions;
