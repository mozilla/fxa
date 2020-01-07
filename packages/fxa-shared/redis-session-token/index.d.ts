declare module 'redis-session-token' {
  export = RedisSessionToken;
}

export declare interface Token {
  lastAccessTime?: number;
  location?: {
    city?: string;
    state?: string;
    stateCode?: string;
    country?: string;
    countryCode?: string;
  };
  uaBrowser?: string;
  uaBrowserVersion?: string;
  uaOS?: string;
  uaOSVersion?: string;
  uaDeviceType?: string;
  uaFormFactor?: string;
}
export function packTokensForRedis(tokens: { [id: string]: Token }): string;
export function unpackTokensFromRedis(tokens: string): { [id: string]: Token };
export default RedisSessionToken = {
  packTokensForRedis,
  unpackTokensFromRedis,
};
