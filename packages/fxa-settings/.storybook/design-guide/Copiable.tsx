/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';

const Copiable = ({ value, children }) => {
  const [isActive, setActive] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(value);
    setActive(true);
    setTimeout(() => {
      setActive(false);
    }, 1000);
  }

  return (
    <span
      onClick={copyToClipboard}
      className="copy-container relative inline-block"
    >
      <button className="copy-content hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-sm pointer bg-white text-grey-900 focus:bg-grey-100 px-1 shadow-md rounded border border-grey-200 rounded-md whitespace-nowrap font-mono pr-7">
        {isActive ? 'copied!' : value}{' '}
        <img
          src="assets/copy-icon.svg"
          className="inline-block w-6 h-6"
          alt="copy"
        />
      </button>
      {children}
    </span>
  );
};

export default Copiable;
