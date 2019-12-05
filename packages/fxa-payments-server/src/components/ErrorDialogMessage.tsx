import React from 'react';
import DialogMessage from './DialogMessage';

/* istanbul ignore next - no-op function not worth testing */
const noop = () => {};

export default ({
  title,
  testid = '',
  error,
  onDismiss = noop,
}: {
  title: string;
  testid?: string;
  error: any;
  onDismiss?: Function;
}) => (
  <DialogMessage className="dialog-error" onDismiss={onDismiss}>
    <h4 data-testid={testid}>{title}</h4>
    {error && error.message && <p>{error.message}</p>}
  </DialogMessage>
);
