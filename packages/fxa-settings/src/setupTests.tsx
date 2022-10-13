/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '@testing-library/jest-dom/extend-expect';
import { FtlMsgProps } from 'fxa-react/lib/utils';

jest.mock('fxa-react/lib/utils', () => ({
  FtlMsg: (props: FtlMsgProps) => (
    <div data-testid="ftlmsg-mock" id={props.id}>
      {props.children}
    </div>
  ),
}));
