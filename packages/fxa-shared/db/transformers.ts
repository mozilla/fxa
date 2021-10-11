/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;

function unbuffer(val: string | Buffer) {
  return Buffer.isBuffer(val) ? val.toString('hex') : val;
}

function buffer(value: string | Buffer) {
  if (Buffer.isBuffer(value)) {
    return value;
  }
  // Don't convert things with no value, but we still want
  // to bufferize falsy things like the empty string.
  if (typeof value !== 'undefined' && value !== null) {
    if (typeof value !== 'string' || !HEX_STRING.test(value)) {
      throw new Error('Invalid hex data for ' + value + '"');
    }
    return Buffer.from(value, 'hex');
  }
  return value;
}

export const uuidTransformer = {
  to: (v: any) => buffer(v),
  from: (v: any) => unbuffer(v),
};

export const intBoolTransformer = {
  to: (v: any) => (v ? 1 : 0),
  from: (v: any) => !!v,
};

export function aggregateNameValuePairs(
  rows: object[],
  idColumn: string,
  nameColumn: string,
  valueColumn: string,
  resultColumn: string
): object[] {
  return (rows as any[]).reduce((items, row) => {
    let curItem = items[items.length - 1];
    // Start a new aggregated item if:
    //   * we're at the start of the list, or
    //   * the upcoming row has a different id then previous.
    //   * the upcoming row has a NULL id (because NULLs never equal each other)
    if (
      !curItem ||
      !row[idColumn] ||
      !curItem[idColumn] ||
      !row[idColumn].equals(curItem[idColumn])
    ) {
      curItem = {};
      Object.keys(row).forEach((column) => {
        if (column !== nameColumn && column !== valueColumn) {
          curItem[column] = row[column];
        }
      });
      // If the id was NULL, this row must have resulted from
      // an outer join with no match in the joined table.
      // The correct aggregated result in this case is NULL.
      curItem[resultColumn] = row[idColumn] ? {} : null;
      items.push(curItem);
    }
    if (row[nameColumn]) {
      curItem[resultColumn][row[nameColumn]] = row[valueColumn];
    }
    return items;
  }, []);
}
