import { z } from 'zod';

/**
 * Validates hapi payloads and returns strongly typed response
 * @param schema
 * @returns
 */
export function zodValidator<T extends z.ZodSchema<any>>(schema: T) {
  return (value: unknown, _options: any) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      // TODO: Mimic joi error
      return result;
    }
    return result.data;
  };
}

/** Regex to parse phone number */
export const E164_NUMBER = /^\+[1-9]\d{1,14}$/;

/**
 * Represents a req.auth object provided by hapi
 */
export const AuthZod = z.object({
  credentials: z.object({
    uid: z.string(),
    email: z.email(),
    // TODO: Add more fields
    // TODO: Validate req.auth obj in auth-strategy
  }),
});
export type AuthDto = z.infer<typeof AuthZod>;

/**
 * Represents a recovery phone setup phone number payload
 */
export const SetupPhoneNumberZod = z.object({
  phoneNumber: z.string().regex(E164_NUMBER),
});
export type SetupPhoneNumberDto = z.infer<typeof SetupPhoneNumberZod>;
