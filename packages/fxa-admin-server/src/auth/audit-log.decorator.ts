/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UseInterceptors } from '@nestjs/common';
import { AuditLogInterceptor } from './audit-log.interceptor';

/**
 * Decorator to automatically log admin actions.
 *
 * Usage:
 * @AuditLog()
 * @Mutation((returns) => Boolean)
 * public async someAction(@Args('uid') uid: string, @CurrentUser() user: string) {
 *   // ...
 * }
 *
 * This will automatically log:
 * - User (admin who performed the action - from request.user set by GqlAuthHeaderGuard)
 * - Action (function/mutation name)
 * - Timestamp (ISO string)
 * - Payload (arguments passed to the mutation, with sensitive data redacted)
 * - Result status (success/error)
 *
 * The interceptor will log:
 * 1. When the action is initiated (before execution)
 * 2. When the action completes successfully (with result)
 * 3. When the action fails (with error details)
 */
export const AuditLog = () => UseInterceptors(AuditLogInterceptor);
