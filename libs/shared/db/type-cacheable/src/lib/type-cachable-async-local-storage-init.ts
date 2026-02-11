import { withTypeCacheableAsyncLocalStorage } from './type-cachable-async-local-storage-adapter';

/**
 * Will instantiate a new AsyncLocalStorage context for this method.
 * This should only be used at the top level of a call chain, for instance when a request first hits the server.
 * Stacked useage of this decorator will result in unexpected behavior.
 */
export function WithTypeCachableAsyncLocalStorage<Target extends object>() {
  type Func = (args: any) => Promise<any>;

  return function (
    _target: Target,
    key: string,
    descriptor: TypedPropertyDescriptor<Func>
  ) {
    const originalDef = descriptor.value as NonNullable<Func>;

    descriptor.value = async function (input: any): Promise<any> {
      return withTypeCacheableAsyncLocalStorage(() => {
        return originalDef.apply(this, [input]);
      });
    };
    return descriptor;
  };
}
