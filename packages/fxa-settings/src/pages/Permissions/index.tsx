/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../components/AppLayout';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import { DisplayablePermission } from '../../lib/oauth/permissions';

export type PermissionRow = {
  scope: DisplayablePermission;
  value?: string;
};

export type PermissionsProps = {
  serviceName: string;
  rows: PermissionRow[];
  onContinue: () => void;
  onCancel: () => void;
};

export const viewName = 'permissions';

const PERMISSION_LABELS: Record<
  DisplayablePermission,
  { ftlId: string; label: string }
> = {
  'profile:email': {
    ftlId: 'permissions-label-email',
    label: 'Email address',
  },
  'profile:display_name': {
    ftlId: 'permissions-label-display-name',
    label: 'Display name',
  },
};

const Permissions = ({
  serviceName,
  rows,
  onContinue,
  onCancel,
}: PermissionsProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      <FtlMsg id="permissions-heading" vars={{ serviceName }}>
        <h1 className="card-header">{serviceName} wants access to:</h1>
      </FtlMsg>

      <ul className="my-6 flex flex-col gap-4" data-testid="permissions-list">
        {rows.map(({ scope, value }) => {
          const { ftlId, label } = PERMISSION_LABELS[scope];
          return (
            <li
              key={scope}
              className="flex flex-col text-start"
              data-testid={`permissions-row-${scope.replace(/:/g, '-')}`}
            >
              <FtlMsg id={ftlId}>
                <span className="text-sm font-semibold">{label}</span>
              </FtlMsg>
              {value ? (
                <span className="text-sm text-grey-400 break-all">{value}</span>
              ) : (
                <FtlMsg id="permissions-value-not-set">
                  <span className="text-sm text-grey-400">Not set</span>
                </FtlMsg>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col justify-center">
        <FtlMsg id="permissions-continue-button">
          <button
            type="button"
            onClick={onContinue}
            data-testid="permissions-continue-button"
            className="cta-primary cta-xl w-full"
          >
            Continue
          </button>
        </FtlMsg>
        <FtlMsg id="permissions-cancel-button">
          <button
            type="button"
            onClick={onCancel}
            data-testid="permissions-cancel-button"
            className="link-grey mt-4 text-sm text-center"
          >
            Cancel
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default Permissions;
