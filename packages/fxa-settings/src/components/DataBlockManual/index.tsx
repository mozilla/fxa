/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

interface DataBlockManualProps {
  secret: string;
}

export const formatSecret = (secret: string) => {
  return secret.toUpperCase().match(/.{4}/g)!.join(' ');
};

export const DataBlockManual = ({ secret }: DataBlockManualProps) => {
  return (
    <p className="my-8 mx-auto font-bold" data-testid="manual-code">
      {formatSecret(secret)}
    </p>
  );
};

export default DataBlockManual;
