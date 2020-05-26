declare module 'fxa-js-client' {
  export = FxAccountClient;
}

declare function FxAccountClient(
  uri: string,
  config: any
): FxAccountClient.Client;

declare namespace FxAccountClient {
  export interface Client {
    sessionStatus(
      sessionToken: string
    ): Promise<{ state: string; uid: string }>;
    attachedClients(sessionToken: string): Promise<any[]>;
    checkTotpTokenExists(
      sessionToken: string
    ): Promise<{ exists: boolean; verified: boolean }>;
    recoveryKeyExists(sessionToken: string): Promise<{ exists: boolean }>;
    account(sessionToken: string): Promise<any>;
  }
}
