import { gql } from '@apollo/client';

export interface Session {
  verified: boolean;
  token: hexstring;
  destroy?: () => void;
}

export const GET_SESSION_VERIFIED = gql`
  query GetSession {
    session {
      verified
    }
  }
`;
