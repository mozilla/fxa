import { gql } from '@apollo/client';

export const GET_ACCOUNT = gql`
  query GetAccount {
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
