/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import moment from 'moment-timezone';
import { determineLocale } from '@fxa/shared/l10n';

const DEFAULT_LOCALE = 'en';
const DEFAULT_TIMEZONE = 'Etc/UTC';

/**
 * Takes a list of emails, returning the primary email as "to" and
 * verified, non-primary emails as "cc".
 * @param emails
 * @returns
 */
export const splitEmails = (
  emails: { email: string; isPrimary?: boolean; isVerified?: boolean }[]
): { to: string; cc: string[] } => {
  return emails.reduce(
    (result: { to: string; cc: string[] }, item) => {
      const { email } = item;

      if (item.isPrimary) {
        result.to = email;
      } else if (item.isVerified) {
        result.cc.push(email);
      }

      return result;
    },
    { to: '', cc: [] }
  );
};

/**
 * Construct a localized time string with timezone.
 * Returns an object containing the localized time and date strings,
 * as well as the acceptLanguage and timeZone used to generate them.
 *
 * Example output: ['9:41:00 AM (PDT)', 'Monday, Jan 1, 2024']
 *
 * @param timeZone - IANA timezone (e.g., 'America/Los_Angeles')
 * @param acceptLanguage - Accept-Language header value
 */
export const constructLocalTimeAndDateStrings = (
  timeZone?: string,
  acceptLanguage?: string
): {
  acceptLanguage: string;
  date: string;
  time: string;
  timeZone: string;
} => {
  moment.tz.setDefault(DEFAULT_TIMEZONE);

  const locale = determineLocale(acceptLanguage) || DEFAULT_LOCALE;
  moment.locale(locale);

  let timeMoment = moment();
  if (timeZone) {
    timeMoment = timeMoment.tz(timeZone);
  }

  const time = timeMoment.format('LTS (z)');
  const date = timeMoment.format('dddd, ll');

  return {
    acceptLanguage: locale,
    date,
    time,
    timeZone: timeZone || DEFAULT_TIMEZONE,
  };
};

/**
 * Construct a localized date string.
 *
 * @param timeZone - IANA timezone (e.g., 'America/Los_Angeles')
 * @param acceptLanguage - Accept-Language header value
 * @param date - Date to format (defaults to now)
 * @param formatString - Moment.js format string (defaults to 'L' for localized date)
 */
export const constructLocalDateString = (
  timeZone?: string,
  acceptLanguage?: string,
  date?: Date | number,
  formatString = 'L'
): string => {
  moment.tz.setDefault(DEFAULT_TIMEZONE);

  const locale = determineLocale(acceptLanguage) || DEFAULT_LOCALE;
  moment.locale(locale);

  let time = moment(date);
  if (timeZone) {
    time = time.tz(timeZone);
  }

  return time.format(formatString);
};
