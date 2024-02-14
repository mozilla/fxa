/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject } from '@nestjs/common';
import { Cacheable, CacheOptions } from '@type-cacheable/core';
import { AuthFirestore, FirestoreService } from '@fxa/shared/db/firestore';
import { FirestoreAdapter } from './type-cachable-firestore-adapter';
import { Firestore } from '@google-cloud/firestore';
import Container from 'typedi';

export interface FirestoreCacheableOptions {
  collectionName: string | ((args: any[], context: any) => string);
}

export function FirestoreCacheable(
  cacheableOptions: CacheOptions,
  firestoreOptions: FirestoreCacheableOptions
) {
  // We try to fetch Firestore here with Nest DI, but need typedi compatibility where there's no Nest for now.
  let injectFirestore: ReturnType<typeof Inject<Firestore>> | undefined;
  try {
    injectFirestore = Inject(FirestoreService);
  } catch (e) {}

  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    injectFirestore?.(target, 'firestore');

    const originalMethod = propertyDescriptor.value;

    propertyDescriptor.value = async function (...args: any[]) {
      // We try to fetch typedi Firestore if available in case this was loaded in a non-Nest environment
      let typediFirestore: Firestore | undefined;
      try {
        typediFirestore = Container.get<Firestore>(AuthFirestore);
      } catch (e) {}

      const firestore = typediFirestore || (this as any).firestore;
      if (!firestore) {
        throw new Error('Could not load Firestore from Nest or typedi');
      }

      const collectionName =
        typeof firestoreOptions.collectionName === 'string'
          ? firestoreOptions.collectionName
          : firestoreOptions.collectionName(args, this);

      const newDescriptor = Cacheable({
        ...cacheableOptions,
        client: new FirestoreAdapter(firestore, collectionName),
      })(target, propertyKey, {
        ...propertyDescriptor,
        value: originalMethod,
      });

      return await newDescriptor.value.apply(this, args);
    };

    return propertyDescriptor;
  };
}
