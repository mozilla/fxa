/**
 * @jest-environment node
 */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NextRequest } from 'next/server';
import { proxy } from './proxy';

const CHECKOUT_URL =
  'http://localhost:3035/en/vpn/monthly/checkout/cart-id/start';
const MOCK_EXPERIMENTATION_ID = 'guest-00000000-0000-0000-0000-000000000000';

const buildRequest = (cookie?: string) =>
  new NextRequest(CHECKOUT_URL, {
    headers: {
      'accept-language': 'en',
      ...(cookie ? { cookie } : {}),
    },
  });

describe('proxy', () => {
  describe('experimentationId cookie', () => {
    it('does not set the cookie when the request already has one', () => {
      const response = proxy(
        buildRequest(`experimentationId=${MOCK_EXPERIMENTATION_ID}`)
      );

      expect(response.cookies.get('experimentationId')).toBeUndefined();
      expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('forwards an existing cookie as x-experimentation-id', () => {
      const response = proxy(
        buildRequest(`experimentationId=${MOCK_EXPERIMENTATION_ID}`)
      );

      expect(
        response.headers.get('x-middleware-request-x-experimentation-id')
      ).toBe(MOCK_EXPERIMENTATION_ID);
    });

    it('sets a guest cookie scoped to the site root when the request has none', () => {
      const response = proxy(buildRequest());

      expect(response.cookies.get('experimentationId')).toEqual({
        name: 'experimentationId',
        value: expect.stringMatching(/^guest-[0-9a-f-]{36}$/),
        path: '/',
      });
    });
  });
});
