import { gql, useQuery } from '@apollo/client';

export interface Session {
  verified: boolean;
  token: hexstring;
}

export const GET_SESSION_VERIFIED = gql`
  query GetSession {
    session {
      verified
    }
  }
`;

export function useSession() {
  const { data } = useQuery<{ session: Session }>(GET_SESSION_VERIFIED, {
    fetchPolicy: 'cache-only',
  });
  return data!.session;
}
