/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InputPassword from '.';

export const SubjectWithPairedInputs = () => {
  return (
    <>
      <InputPassword label="Make me visible..." />
      <InputPassword label="...and I'll be visible too." />
      <p className="text-sm italic mt-10">
        <strong>Tip:</strong> Toggling visibility in one field controls
        visibility in both.
      </p>
    </>
  );
};
