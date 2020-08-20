import React, { useCallback, useRef, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import sentryMetrics from 'fxa-shared/lib/sentry';
import TextInput from '../TextInput';
import { Link } from '@reach/router';

export const CREATE_SECONDARY_EMAIL_MUTATION = gql`
  mutation createSecondaryEmailMutation($input: EmailInput!) {
    createSecondaryEmail(input: $input) {
      clientMutationId
    }
  }
`;

export const SecondaryEmailInputForm = () => {
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const [createSecondaryEmailCode, { data, error }] = useMutation(
    CREATE_SECONDARY_EMAIL_MUTATION,
    {
      onError: (error) => {
        sentryMetrics.captureException(error);
      },
    }
  );

  const createSecondaryEmailCodeHandler = () => {
    if (inputRef.current) {
      createSecondaryEmailCode({
        variables: { input: { email: inputRef.current.value } },
      });
    }
  };

  const checkEmail = useCallback(
    (ev) => {
      setSaveBtnDisabled(!ev.target.checkValidity());
    },
    [saveBtnDisabled, setSaveBtnDisabled]
  );

  return (
    <div className="p-10 max-w-md">
      <div className="mb-3" data-testid="secondary-email-input">
        <TextInput
          label="Secondary Email"
          placeholder="Enter email address"
          type="email"
          errorText={error?.message}
          onChange={checkEmail}
          {...{ inputRef }}
        />
      </div>

      <div className="flex justify-center space-x-6">
        <Link
          className="cta-neutral-lg transition-standard mb-3 w-32"
          data-testid="cancel-button"
          to="/beta/settings"
        >
          Cancel
        </Link>

        <button
          className={`cta-primary transition-standard mb-3 w-32 ${
            saveBtnDisabled ? 'opacity-25' : ''
          }`}
          data-testid="save-button"
          onClick={createSecondaryEmailCodeHandler}
          disabled={saveBtnDisabled}
        >
          Save
        </button>
      </div>
    </div>
  );
};
