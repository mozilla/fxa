declare module 'redis' {
  export = RedisFactory;
}

export default function RedisFactory(
  config: RedisConfig,
  logger: Logger
): FxaRedisClient;

export interface FxaRedisClient {
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<'OK'>;
  del(...keys: string[]): Promise<number>;
  zadd(...args: any[]): Promise<number | string>;
  zrange(
    key: string,
    start: number,
    stop: number,
    withscores?: string
  ): Promise<string[]>;
  zrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    withscores?: string
  ): Promise<string[]>;
  zrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    limit: string,
    offset: number,
    count: number
  ): Promise<string[]>;
  zrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    withscores: string,
    limit: string,
    offset: number,
    count: number
  ): Promise<string[]>;
  zrem(...args: any[]): Promise<number>;
  zrevrange(
    key: string,
    start: number,
    stop: number,
    withscores?: string
  ): Promise<string[]>;
  zrevrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    withscores?: string
  ): Promise<string[]>;
  zrevrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    limit: string,
    offset: number,
    count: number
  ): Promise<string[]>;
  zrevrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    withscores: string,
    limit: string,
    offset: number,
    count: number
  ): Promise<string[]>;
  update(key: string, cb?: Callback<string>): void;
  zpoprangebyscore(
    key: string,
    min: number,
    max: number,
    withScore: boolean
  ): Promise<string[]>;
}

export interface RedisConfig {
  host: string;
  port: number;
  enabled: boolean;
  prefix: string;
  maxConnections: number;
  minConnections: number;
}

export interface Logger {
  error(type: string, fields: object): void;
  info(type: string, fields: object): void;
  warning(type: string, fields: object): void;
}
