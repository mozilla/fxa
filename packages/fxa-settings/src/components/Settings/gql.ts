import gql from 'graphql-tag';

export const GET_ACCOUNT = gql`
  query {
    account {
      uid
      displayName
      avatarUrl
      accountCreated
      passwordCreated
      recoveryKey
      emails {
        email
        isPrimary
        verified
      }
      attachedClients {
        clientId
        isCurrentSession
        userAgent
        deviceType
        deviceId
      }
      totp {
        exists
        verified
      }
      subscriptions {
        created
        productName
      }
    }
  }
`;

export interface accountData {
  uid: string;
  displayName: string | null;
  avatarUrl: string | null;
  accountCreated: number;
  passwordCreated: number;
  recoveryKey: boolean;
  emails: {
    email: string;
    isPrimary: boolean;
    verified: boolean;
  }[];
  attachedClients: {
    clientId: string;
    isCurrentSession: boolean;
    userAgent: string;
    deviceType: string;
    deviceId: string;
  }[];
  totp: {
    exists: boolean;
    verified: boolean;
  };
  subscriptions: {
    created: number;
    productName: string;
  }[];
}
