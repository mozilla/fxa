import React from 'react';
import { FetchState } from '../store/types';
import { APIError } from '../lib/apiClient';
import DialogMessage from './DialogMessage';

export default ({
  title,
  testid = '',
  fetchState,
  onDismiss = () => {},
}: {
  title: string;
  testid?: string;
  fetchState: FetchState<any, APIError>;
  onDismiss?: Function;
}) => (
  <DialogMessage className="dialog-error" onDismiss={onDismiss}>
    <h4 data-testid={testid}>{title}</h4>
    {fetchState.error && fetchState.error.message && (
      <p>{fetchState.error.message}</p>
    )}
  </DialogMessage>
);
