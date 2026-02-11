/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const parseBooleanArg = (val: boolean | string) => {
  const allowedValues = ['false', 'true'];
  const normalizedVal = `${val}`.toLowerCase();

  if (!allowedValues.includes(normalizedVal)) {
    throw new Error(`Invalid boolean argument value: ${val}`);
  }

  return Boolean(allowedValues.indexOf(normalizedVal));
};

// helper to collect repeatable Commander args into a single array
export const collect = () => (val: string, xs: string[]) => {
  xs.push(val);
  return xs;
};
