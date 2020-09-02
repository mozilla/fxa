declare module 'mozlog' {
  export = LoggerConfigFactory;
}

declare function LoggerConfigFactory(
  config: any
): LoggerConfigFactory.LoggerFactory;

declare namespace LoggerConfigFactory {
  type LoggerFactory = (typePrefix: any) => Logger;

  export interface Logger {
    debug(type: string, fields: object): void;
    error(type: string, fields: object): void;
    info(type: string, fields: object): void;
    warning(type: string, fields: object): void;
    warn(type: string, fields: object): void;
    verbose(type: string, fields: object): void;
  }
}
