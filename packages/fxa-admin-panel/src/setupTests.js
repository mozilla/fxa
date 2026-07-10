/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '@testing-library/jest-dom/extend-expect';
import { TextEncoder, TextDecoder } from 'util';

// react-router v7 requires TextEncoder/TextDecoder in its internal modules.
// jsdom does not provide these by default.
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
