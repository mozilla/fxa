/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import cacheManager from '@type-cacheable/core';

// Must be disabled globally per https://github.com/joshuaslate/type-cacheable?tab=readme-ov-file#change-global-options
// otherwise @Cacheable context will be undefined when using strategy/client builder functions
cacheManager.setOptions({
  excludeContext: false,
});

export * from './lib/type-cachable-async-local-storage-adapter';
export * from './lib/type-cachable-async-local-storage-init';
export * from './lib/type-cachable-cache-first';
export * from './lib/type-cachable-firestore-adapter';
export * from './lib/type-cachable-memory-adapter';
export * from './lib/type-cachable-stale-while-revalidate-with-fallback';
