/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MOCK_FULL_PHONE_NUMBER,
  MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
} from '../pages/mocks';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { formatPhoneNumber } from './recovery-phone-utils';

describe('formatPhoneNumber', () => {
  let mockFtlMsgResolver: FtlMsgResolver;

  beforeEach(() => {
    mockFtlMsgResolver = {
      getMsg: jest.fn((_, defaultMsg) => defaultMsg),
    } as unknown as FtlMsgResolver;
  });

  it('masks NANP national format phone number correctly', () => {
    const result = formatPhoneNumber({
      phoneNumber: MOCK_FULL_PHONE_NUMBER,
      nationalFormat: MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
      ftlMsgResolver: mockFtlMsgResolver,
    });
    expect(result.maskedPhoneNumber).toBe('(•••) •••-1234');
    expect(result.lastFourPhoneDigits).toBe('1234');
  });

  it('masks non-NANP national format phone number correctly', () => {
    const result = formatPhoneNumber({
      phoneNumber: '+33987654321',
      nationalFormat: '+33 9 87 65 43 21',
      ftlMsgResolver: mockFtlMsgResolver,
    });
    expect(result.maskedPhoneNumber).toBe('+•• • •• •• 43 21');
    expect(result.lastFourPhoneDigits).toBe('4321');
  });

  it('masks fallback phone number when nationalFormat is null', () => {
    const result = formatPhoneNumber({
      phoneNumber: MOCK_FULL_PHONE_NUMBER,
      nationalFormat: null,
      ftlMsgResolver: mockFtlMsgResolver,
    });
    expect(result.maskedPhoneNumber).toBe('+•••••••1234');
    expect(result.lastFourPhoneDigits).toBe('1234');
  });

  it('returns localized message when only last four digits are provided (unverified session)', () => {
    const result = formatPhoneNumber({
      phoneNumber: '4567',
      nationalFormat: '4567',
      ftlMsgResolver: mockFtlMsgResolver,
    });
    expect(mockFtlMsgResolver.getMsg).toHaveBeenCalledWith(
      'recovery-phone-number-ending-digits',
      'Number ending in 4567',
      { lastFourPhoneNumber: '4567' }
    );
    expect(result.maskedPhoneNumber).toBe('Number ending in 4567');
    expect(result.lastFourPhoneDigits).toBe('4567');
  });
});
