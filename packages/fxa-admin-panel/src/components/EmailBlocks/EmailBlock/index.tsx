/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import './index.scss';

const mockEmailBlock = {
  account: {
    uid: 'a1b2c3d4',
    email: 'user@example.com',
    createdAt: 1582246450000,
    emailVerified: true,
    emailBounces: [
      {
        email: 'user@example.com',
        createdAt: 1582246455000,
        bounceType: 'transient',
        bounceSubType: 'suppressed',
      },
    ],
  },
};

export const EmailBlock = () => {
  const { account } = mockEmailBlock;
  const accountIsVerified = account.emailVerified;
  const emailBounce = account.emailBounces[0];
  return (
    <section className="email-block">
      <ul>
        <li className="flex justify-space-between">
          <h3>{account.email}</h3>
          <span className={`${accountIsVerified ? 'verify' : ''}`}>
            {accountIsVerified ? 'verified' : 'not verified'}
          </span>
        </li>
        <li className="flex justify-space-between">
          <div>
            uid: <span className="result">{account.uid}</span>
          </div>
          <div>
            created at:{' '}
            <span className="result">
              [formatted time from {account.createdAt}]
            </span>
          </div>
        </li>
        <li>
          <h4>Email bounces</h4>
        </li>
        {/* if account.emailBounces */}
        <li>
          <ul className="email-bounces">
            {/* for each email bounce */}
            <li>
              email: <span className="result">{emailBounce.email}</span>
            </li>
            <li>
              created at:{' '}
              <span className="result">
                [formatted time from {emailBounce.createdAt}]
              </span>
            </li>
            <li>
              bounce type:{' '}
              <span className="result">{emailBounce.bounceType}</span>
            </li>
            <li>
              bounce subtype:{' '}
              <span className="result">{emailBounce.bounceSubType}</span>
            </li>
            <li>
              <button className="delete">Delete email block</button>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  );
};

export default EmailBlock;
