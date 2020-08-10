import React from 'react';
import { AlertBar } from '../AlertBar';
import { useAccount } from '../../models';
import { alertTextExternal } from '../../lib/cache';

export const AlertExternal = () => {
  const account = useAccount();

  return account.alertTextExternal ? (
    <AlertBar
      onDismiss={() => {
        alertTextExternal(null);
      }}
    >
      <p data-testid="alert-external-text">{account.alertTextExternal}</p>
    </AlertBar>
  ) : null;
};

export default AlertExternal;
