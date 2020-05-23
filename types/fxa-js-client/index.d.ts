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
    createOAuthToken(
      sessionToken: string,
      clientId: string,
      options?: { scope?: string; ttl?: number; access_type?: 'online' | 'offline' }
    ): Promise<{
      access_token: string;
      refresh_token?: string;
      id_token?: string;
      scope: string[];
      auth_at?: number;
      token_type: string;
      expires_in: number;
    }>;
    recoveryEmailCreate(sessionToken: string, email: string): Promise<any>;
    recoveryEmailDestroy(sessionToken: string, email: string): Promise<any>;
    recoveryEmailSetPrimaryEmail(sessionToken: string, email: string): Promise<any>;
    recoveryEmailSecondaryResendCode(sessionToken: string, email: string): Promise<any>;
  }
}
