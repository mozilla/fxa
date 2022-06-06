import React from 'react';
import { FetchState } from '../store/types';
import { APIError } from '../lib/apiClient';
import Modal from 'fxa-react/components/Modal';

const FetchErrorDialogMessage = ({
  title,
  testid = '',
  fetchState,
  onDismiss,
}: {
  title: string;
  testid?: string;
  fetchState: FetchState<any, APIError>;
  onDismiss?: () => void;
}) => (
  <Modal
    className="dialog-error"
    onDismiss={onDismiss as () => void}
  >
    <h4 data-testid={testid}>{title}</h4>
    {fetchState.error?.message && (
      <p>{fetchState.error.message}</p>
    )}
  </Modal>
);

export default FetchErrorDialogMessage;
