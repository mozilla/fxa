/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useRef } from 'react';
import FlowContainer from '../FlowContainer';
import InputText from '../InputText';

export const PageDisplayName = ({}: RouteComponentProps) => {
  const displayNameRef = useRef<HTMLInputElement>(null);

  return (
    <FlowContainer title="Display Name">
      <div className="my-6">
        <InputText
          label="Enter display name"
          className="mb-2"
          data-testid="display-name-input"
          inputRef={displayNameRef}
        />
      </div>
      <div className="flex justify-center mb-4 mx-auto max-w-64">
        <button
          className="cta-neutral mx-2 flex-1"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          data-testid="submit-display-name"
          className="cta-primary mx-2 flex-1"
        >
          Save
        </button>
      </div>
    </FlowContainer>
  );
};

export default PageDisplayName;
