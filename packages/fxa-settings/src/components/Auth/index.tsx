import React, {useContext} from 'react';
import AuthClient from 'fxa-auth-client/browser';
import { useQuery, gql } from '@apollo/client';
import { useAwait } from 'fxa-react/lib/hooks';
import { AccountData } from '../AccountDataHOC/gql';
import { sessionToken } from '../../lib/cache'

export const GET_PASSWORD_INFO = gql`
  query GetPasswordInfo {
    account {
      emails {
        email
        isPrimary
      }
    }
    sessionToken @client
    oldPassword @client
    newPassword @client
  }
`

export interface AuthContextValue {
  client?: AuthClient
};

export const AuthContext = React.createContext<AuthContextValue>({})
export {AuthClient}

export function useAuth() {
  const {client} = useContext(AuthContext)
  if (!client) {
    throw new Error('Are you forgetting an AuthContext.Provider?')
  }
  return client!;
}

export function usePasswordChanger() {
  const auth = useAuth()
  const { data } = useQuery(GET_PASSWORD_INFO)
  const primaryEmail = (data.account as AccountData).emails.find((email) => email.isPrimary)!;
  const [passwordChangeState, execute, reset] = useAwait(async () => {
    const response = await auth.passwordChange(primaryEmail.email, data.oldPassword, data.newPassword, { sessionToken: data.sessionToken })
    sessionToken(response.sessionToken)
    console.error(response)
    return response
  })
  return {
    passwordChangeState,
    changePassword: execute
  }
}
