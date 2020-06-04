/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT, AccountData } from './gql';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';

type AccountDataHOCChildrenProps = {
  account: AccountData;
};
type AccountDataHOCProps = {
  children: (props: AccountDataHOCChildrenProps) => React.ReactNode;
};

// A data extraction layer for initial load.
// TODO: If an account is unverified we'll need to
// requery with less requested properties.
export const AccountDataHOC = ({ children }: AccountDataHOCProps) => {
  const { loading, error, data } = useQuery(GET_ACCOUNT);

  if (loading) {
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

  if (error) {
    return <AppErrorDialog data-testid="error-dialog" {...{ error }} />;
  }

  const account: AccountData = data.account;

  return <>{children({ account })}</>;
};

export default AccountDataHOC;
