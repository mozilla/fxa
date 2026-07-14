/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';
import { zodToOpenApi } from './openapi';

describe('zodToOpenApi', () => {
  it('converts a simple object schema to JSON Schema without $schema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().optional(),
    });

    const result = zodToOpenApi(schema);

    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
      additionalProperties: false,
    });
    expect(result).not.toHaveProperty('$schema');
  });

  it('converts a discriminated union to a oneOf schema', () => {
    const schema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), value: z.string() }),
      z.object({ type: z.literal('b'), count: z.number() }),
    ]);

    const result = zodToOpenApi(schema);

    expect(result).toHaveProperty('oneOf');
    expect((result as { oneOf: unknown[] }).oneOf).toHaveLength(2);
  });

  it('preserves .describe() annotations as description fields', () => {
    const schema = z.object({
      name: z.string().describe('The user display name'),
      age: z.number().optional().describe('Age in years'),
    });

    const result = zodToOpenApi(schema);

    const properties = (
      result as { properties: Record<string, { description?: string }> }
    ).properties;
    expect(properties['name'].description).toBe('The user display name');
    expect(properties['age'].description).toBe('Age in years');
  });

  it('converts a primitive string schema', () => {
    const result = zodToOpenApi(z.string());

    expect(result).toEqual({ type: 'string' });
    expect(result).not.toHaveProperty('$schema');
  });

  it('converts an array schema', () => {
    const result = zodToOpenApi(z.array(z.number()));

    expect(result).toEqual({
      type: 'array',
      items: { type: 'number' },
    });
    expect(result).not.toHaveProperty('$schema');
  });

  it('converts nullable optional fields correctly', () => {
    const schema = z.object({
      label: z.string().nullable().optional(),
    });

    const result = zodToOpenApi(schema);

    expect(result).toHaveProperty('properties.label');
    // When no fields are required, `required` is either absent or an empty array
    const required = (result as { required?: string[] }).required;
    if (required) {
      expect(required).not.toContain('label');
    }
  });
});
