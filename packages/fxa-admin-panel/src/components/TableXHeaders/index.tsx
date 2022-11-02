/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Children, ReactElement } from 'react';

interface TableXHeadersProps {
  header?: string;
  rowHeaders: string[];
  testId?: string;
  className?: string;
  children:
    | ReactElement<TableRowXHeaderProps>
    | ReactElement<TableRowXHeaderProps>[];
}

interface TableRowXHeaderProps {
  children: ReactElement | ReactElement[];
  testId?: string;
}

/**
 *  Every child must be a valid React element, including but not limited to fragments.
 * If a child element is anything but a `td`, the element is placed inside a `td` with classes.
 * If the element is a `td`, this takes the children and props of that `td` and places them
 * inside a new `td` with classes which is useful when you don't want to generate a new DOM
 * element inside a `td` unnecessarily.
 */
export const TableRowXHeader = ({ children, testId }: TableRowXHeaderProps) => {
  const arrayElements = Children.toArray(children);
  const tableTdClasses = 'table-td border-r border-b';

  return (
    <tr data-testid={testId}>
      {arrayElements.map((element, i) => {
        if (React.isValidElement(element) && element.type === 'td') {
          const {
            className: elementClassNames,
            children: elementChildren,
            ...props
          } = element.props;

          return (
            <td
              className={`${elementClassNames} ${tableTdClasses}`}
              key={i}
              {...props}
            >
              {elementChildren}
            </td>
          );
        }
        return (
          <td className={tableTdClasses} key={i}>
            {element}
          </td>
        );
      })}
    </tr>
  );
};

export const TableXHeaders = ({
  header,
  rowHeaders,
  children,
  testId,
  className = 'table-x-headers border-l-thick',
}: TableXHeadersProps) => (
  <>
    {header && <h3 className="header-lg">{header}</h3>}
    <table {...{ className }} data-testid={testId}>
      <thead>
        <tr>
          {rowHeaders.map((rowHeader) => (
            <th className="table-th" key={rowHeader}>
              {rowHeader}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>{children}</tbody>
    </table>
  </>
);
