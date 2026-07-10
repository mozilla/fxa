/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccountAuthorization } from 'fxa-admin-server/src/types';
import { TableRowXHeader, TableXHeaders } from '../../TableXHeaders';
import { getFormattedDate } from '../../../lib/utils';

export const AccountAuthorizations = ({
  authorizations,
}: {
  authorizations?: Nullable<AccountAuthorization[]>;
}) => {
  if (!authorizations || authorizations.length === 0) {
    return (
      <p data-testid="account-authorizations-none" className="result-none">
        This account has not authorized any browser services.
      </p>
    );
  }

  return (
    <TableXHeaders
      rowHeaders={[
        'Service',
        'Scope',
        'Client ID',
        'First Authorized',
        'Last Authorized',
      ]}
    >
      {authorizations.map(
        ({
          service,
          scope,
          clientId,
          firstAuthorizedTosAt,
          lastAuthorizedTosAt,
        }) => (
          <TableRowXHeader key={`${service}-${scope}-${clientId}`}>
            <td data-testid="account-authorization-service">{service}</td>
            <td data-testid="account-authorization-scope">{scope}</td>
            <td data-testid="account-authorization-client-id">{clientId}</td>
            <td data-testid="account-authorization-first-authorized-at">
              {getFormattedDate(firstAuthorizedTosAt)}
            </td>
            <td data-testid="account-authorization-last-authorized-at">
              {getFormattedDate(lastAuthorizedTosAt)}
            </td>
          </TableRowXHeader>
        )
      )}
    </TableXHeaders>
  );
};
