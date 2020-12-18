export async function props(promises: Record<string, Promise<any>>) {
  // resolve promises in parallel
  await Promise.all(Object.values(promises));
  // create the resolved object
  const m = new Map<string, any>();
  for (const [key, promise] of Object.entries(promises)) {
    m.set(key, await promise);
  }
  return Object.fromEntries(m);
}
