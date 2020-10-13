/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { useAccount } from 'fxa-settings/src/models';
import { useForm } from 'react-hook-form';
import React, { ChangeEvent, useRef, useCallback, useState } from 'react';
import FlowContainer from '../FlowContainer';
import InputText from '../InputText';

const validateDisplayName = (currentDisplayName: string) => (
  newDisplayName: string
) => newDisplayName !== '' && newDisplayName !== currentDisplayName;

export const PageDisplayName = ({}: RouteComponentProps) => {
  const user = useAccount();
  const { register, handleSubmit, formState, trigger } = useForm();
  const isValidDisplayName = validateDisplayName(user.displayName || '');

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    // TODO FXA-1645
  };

  return (
    <FlowContainer title="Display Name">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-6">
          <InputText
            name="displayName"
            label="Enter display name"
            className="mb-2"
            data-testid="display-name-input"
            onChange={() => trigger('displayName')}
            inputRef={register({
              required: true,
              validate: isValidDisplayName,
            })}
          />
        </div>
        <div className="flex justify-center mb-4 mx-auto max-w-64">
          <button
            type="button"
            data-testid="cancel-display-name"
            className="cta-neutral mx-2 flex-1"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="submit-display-name"
            className="cta-primary mx-2 flex-1"
            disabled={!formState.isDirty || !formState.isValid}
          >
            Save
          </button>
        </div>
      </form>
    </FlowContainer>
  );
};

export default PageDisplayName;
