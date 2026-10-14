/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as dns from 'dns';
import { NotFoundErrorCodes } from './emailValidatorErrors';
const resolver = new dns.promises.Resolver();

const tryResolveWith =
  (resolveFunc: (arg: any) => any) => async (domain: string) => {
    try {
      const records = await resolveFunc(domain);
      // We don't do anything with the records
      return records && records.length;
    } catch (err) {
      if (NotFoundErrorCodes.includes(err.code)) {
        return false;
      }
      throw err;
    }
  };

export const tryResolveMx = async (domain: string) => {
  return tryResolveWith(resolver.resolveMx.bind(resolver))(domain);
};

export const tryResolveIpv4 = async (domain: string) => {
  return tryResolveWith(resolver.resolve4.bind(resolver))(domain);
};
