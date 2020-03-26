/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import dateFormat from 'dateformat';
import './index.scss';

type AccountProps = {
  uid: string;
  email: string;
  createdAt: number;
  emailVerified: boolean;
  emailBounces: Array<EmailBounceProps>;
};

type EmailBounceProps = {
  email: string;
  createdAt: number;
  bounceType: string;
  bounceSubType: string;
};

const DATE_FORMAT = 'yyyy-mm-dd @ HH:MM:ss Z';

export const Account = ({
  uid,
  email,
  createdAt,
  emailVerified,
  emailBounces,
}: AccountProps) => {
  const date = dateFormat(new Date(createdAt), DATE_FORMAT);

  return (
    <section className="account" data-testid="account">
      <ul>
        <li className="flex justify-space-between">
          <h3>{email}</h3>
          <span className={`${emailVerified ? 'verified' : 'not-verified'}`}>
            {emailVerified ? 'verified' : 'not verified'}
          </span>
        </li>
        <li className="flex justify-space-between">
          <div>
            uid: <span className="result">{uid}</span>
          </div>
          <div className="created-at">
            created at: <span className="result">{createdAt}</span>
            <br />
            {date}
          </div>
        </li>
        <li>
          <h4>Email bounces</h4>
        </li>

        {emailBounces.length > 0 ? (
          emailBounces.map((emailBounce: EmailBounceProps) => (
            <EmailBounce key={emailBounce.createdAt} {...emailBounce} />
          ))
        ) : (
          <li className="email-bounce">
            This account doesn't have any bounced emails.
          </li>
        )}
      </ul>
    </section>
  );
};

const EmailBounce = ({
  email,
  createdAt,
  bounceType,
  bounceSubType,
}: EmailBounceProps) => {
  const date = dateFormat(new Date(createdAt), DATE_FORMAT);
  return (
    <li data-testid="bounce">
      <ul className="email-bounce">
        <li>
          email: <span className="result">{email}</span>
        </li>
        <li>
          created at: <span className="result">{createdAt}</span> ({date})
        </li>
        <li>
          bounce type: <span className="result">{bounceType}</span>
        </li>
        <li>
          bounce subtype: <span className="result">{bounceSubType}</span>
        </li>
        <li>
          <button className="delete">Delete email block</button>
        </li>
      </ul>
    </li>
  );
};

export default Account;
