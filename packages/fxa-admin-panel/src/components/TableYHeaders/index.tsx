/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactElement } from 'react';
import { HIDE_ROW } from '../../../constants';

interface TableYHeadersProps {
  header?: string | ReactElement | ReactElement[];
  testId?: string;
  className?: string;
  children:
    | ReactElement<TableRowYHeaderProps>
    | ReactElement<TableRowYHeaderProps>[];
}

interface TableRowYHeaderProps {
  header: string;
  children?: string | ReactElement | ReactElement[];
  testId?: string;
  className?: string;
}

export const TableRowYHeader = ({
  header,
  children,
  testId,
  className,
}: TableRowYHeaderProps) => {
  if (!children || children === HIDE_ROW) {
    return null;
  }

  return (
    <tr {...{ className }}>
      <th className="table-th text-left">{header}</th>
      <td data-testid={testId} className="table-td border-b">
        {children}
      </td>
    </tr>
  );
};

export const TableYHeaders = ({
  header,
  children,
  testId,
  className = 'table-y-headers border-l-thick',
}: TableYHeadersProps) => {
  const Header = () => {
    return typeof header === 'string' ? (
      <h3 className="header-lg">{header}</h3>
    ) : (
      <>{header || ''}</>
    );
  };

  return (
    <>
      <table {...{ className }} data-testid={testId}>
        <thead>
          <td colSpan={100}>
            <Header />
          </td>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </>
  );
};
