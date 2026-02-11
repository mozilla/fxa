import React from 'react';
import { FetchState } from '../store/types';
import { APIError } from '../lib/apiClient';
import DialogMessage from './DialogMessage';

const ariaLabelledBy = "fetch-error-header";
const ariaDescribedBy = "fetch-error-description";

const FetchErrorDialogMessage = ({
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
  <DialogMessage
    className="dialog-error"
    onDismiss={onDismiss}
    headerId={ariaLabelledBy}
    descId={ariaDescribedBy}
  >
    <h4 id={ariaLabelledBy} data-testid={testid}>{title}</h4>
    {fetchState.error && fetchState.error.message && (
      <p id={ariaDescribedBy}>{fetchState.error.message}</p>
    )}
  </DialogMessage>
);

export default FetchErrorDialogMessage;
