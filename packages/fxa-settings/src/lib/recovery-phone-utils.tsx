/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsgResolver } from 'fxa-react/lib/utils';

const NUMBER_OF_DIGITS_TO_SHOW = 4;
/**
 * When the user has a verified session, we get back the full national format
 * phone number from Twilio, if available. We still want to "mask" it in some
 * cases to only show the last 4 digits while keeping the formatting from Twilio.
 * */
function maskNationalFormatPhoneNumber(numberToMask: string) {
  const digits = numberToMask.replace(/\D/g, '');
  const digitsToMask = digits.length - NUMBER_OF_DIGITS_TO_SHOW;

  let maskedDigitsCount = 0;
  // Replace digits with '•' or keep them based on their position
  const maskedPhoneNumber = numberToMask.replace(/\d/g, (digit) => {
    if (maskedDigitsCount < digitsToMask) {
      maskedDigitsCount++;
      return '•';
    } else {
      return digit;
    }
  });
  return maskedPhoneNumber;
}

/**
 * This function ensures the phone number is masked correctly.
 * If passed the last 4 digits of the phone number, it will return a localized
 * string. If passed a nationalFormat or full phone number, it will mask all
 * numbers except the last 4 digits.
 * @param phoneNumber - A full number, or last 4 digits
 * @param nationalFormat - A nationalFormat phone number, or last 4 digits
 * @returns maskedPhoneNumber - will be localized copy if the user does not
 * have a verified session, e.g. "Number ending in 7890", or the national
 * format with only the last 4 shown, e.g. (•••) •••-7890
 * @returns lastFourPhoneDigits - the last 4 digits of the phone number
 * */
export function formatPhoneNumber({
  phoneNumber,
  nationalFormat,
  ftlMsgResolver,
}: {
  phoneNumber: string;
  nationalFormat: null | string;
  ftlMsgResolver: FtlMsgResolver;
}) {
  // Prefer nationalFormat, but use phoneNumber as a fallback in case
  // nationalFormat is not available
  const numberToMask = nationalFormat || phoneNumber;
  // This may already only be 4 digits, but this guarantees it
  const lastFourPhoneDigits = phoneNumber.slice(-NUMBER_OF_DIGITS_TO_SHOW);

  const maskedPhoneNumber =
    numberToMask.length === NUMBER_OF_DIGITS_TO_SHOW
      ? // This means the user does not have a verified session
        ftlMsgResolver.getMsg(
          'recovery-phone-number-ending-digits',
          `Number ending in ${numberToMask}`,
          { lastFourPhoneNumber: numberToMask }
        )
      : maskNationalFormatPhoneNumber(numberToMask);

  return { maskedPhoneNumber, lastFourPhoneDigits };
}
