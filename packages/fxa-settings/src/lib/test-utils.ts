/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen } from '@testing-library/react';

export const typeByTestIdFn = (testId: string) => async (x: string) => {
  await act(async () => {
    const input = screen.getByTestId(testId);
    input.focus();
    fireEvent.input(input, {
      target: { value: x },
    });
  });
};

export const typeByLabelText = (labelText: string) => async (x: string) => {
  const input = screen.getByLabelText(labelText, { exact: false });
  input.focus();
  fireEvent.input(input, {
    target: { value: x },
  });
};

type LinkParamValue = string | null;

export const getSearchWithParams = ({
  mockToken,
  mockCode,
  mockEmail,
  mockPasswordHash,
  mockUid,
}: {
  mockToken: LinkParamValue;
  mockCode: LinkParamValue;
  mockEmail: LinkParamValue;
  mockPasswordHash?: LinkParamValue;
  mockUid?: LinkParamValue;
}) => {
  const tokenParam = mockToken !== null ? `token=${mockToken}&` : '';
  const codeParam = mockCode !== null ? `code=${mockCode}&` : '';
  const emailParam = mockEmail !== null ? `email=${mockEmail}&` : '';
  const passwordHashParam = mockPasswordHash
    ? `emailToHashWith=${mockPasswordHash}`
    : '';
  const uidParam = mockUid ? `uid=${mockUid}` : '';
  return `?${tokenParam}${codeParam}${emailParam}${passwordHashParam}${uidParam}`;
};
