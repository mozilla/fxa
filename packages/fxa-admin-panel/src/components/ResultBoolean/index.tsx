/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const ResultBoolean = ({
  isTruthy,
  testId,
  format = true,
}: {
  isTruthy: boolean;
  testId?: string;
  format?: boolean;
}) => {
  const className = format
    ? `font-semibold ${isTruthy ? 'text-green-900' : 'text-red-700'}`
    : undefined;
  return (
    <span {...{ className }} data-testid={testId}>
      {isTruthy ? 'Yes' : 'No'}
    </span>
  );
};

export default ResultBoolean;
