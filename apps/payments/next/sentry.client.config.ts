/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 *  Currently not making use of Sentry recommended sentry.client.config.ts
 *
 *  The primary reason is that currently NEXT_PUBLIC_* environment
 *  variables used by Sentry Client are set during build time. The current
 *  SubPlat build process does not support different variables for
 *  different environments at build time.
 *
 *  Sentry Client is currently initialized as part of
 *  libs/payments/ui/src/lib/client/providers/Providers.tsx
 *
 */
