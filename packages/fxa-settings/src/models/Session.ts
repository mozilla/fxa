import { gql } from '@apollo/client';
import { GetSession_session } from '../types/GetSession';

export type Session = GetSession_session & {
  destroy?: () => void;
};

export const GET_SESSION_VERIFIED = gql`
  query GetSession {
    session {
      verified
      token
    }
  }
`;
