declare module 'portfinder' {
  interface PortFinderOptions {
    port?: number;
    stopPort?: number;
    host?: string;
  }

  export function getPortPromise(options?: PortFinderOptions): Promise<number>;
  export function getPort(
    options: PortFinderOptions,
    callback: (err: Error | null, port: number) => void
  ): void;
  export function getPort(callback: (err: Error | null, port: number) => void): void;

  export let basePort: number;
  export let highestPort: number;
}
