import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  debug: true,
  providers: [], // Add providers with an empty array for now
  pages: {
    error: '/error',
    signIn: '/error',
  },
} satisfies NextAuthConfig;
