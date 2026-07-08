/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SetMetadata } from '@nestjs/common';
import { z } from 'zod';

export const RESPONSE_SCHEMA_KEY = 'RESPONSE_SCHEMA';

/** JSON Schema subset used inline in OpenAPI `@ApiResponse` decorators. */
export type OpenApiSchema = Record<string, unknown>;

/** Converts a Zod schema to JSON Schema, stripping `$schema` for OpenAPI inline use. */
export function zodToOpenApi(schema: z.ZodType): OpenApiSchema {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema, ...rest } = jsonSchema;
  return rest;
}

/** Attaches a Zod schema to a route for ResponseValidationInterceptor. */
export const ValidateResponse = (schema: z.ZodType) =>
  SetMetadata(RESPONSE_SCHEMA_KEY, schema);
