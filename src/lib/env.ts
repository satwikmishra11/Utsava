import { z } from 'zod';

const DEFAULT_DEV_SESSION_SECRET = 'utsava-dev-session-secret-must-be-at-least-32-chars-long';

/**
 * Validated environment variable schema for application configuration.
 */
export const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    LLM_PROVIDER: z.enum(['auto', 'gemini', 'claude', 'mock']).default('auto'),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_MODEL: z.string().min(1).default('claude-sonnet-5-5'),
    GEMINI_API_KEY: z.string().min(1).optional(),
    GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
    ALLOW_DEMO_MODE: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.toLowerCase() === 'true' : Boolean(val)),
        z.boolean()
      )
      .default(false),
    SESSION_SECRET: z.string().min(32).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && !data.SESSION_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message:
          'SESSION_SECRET must be explicitly provided and at least 32 characters in production',
      });
    }
  })
  .transform((data) => ({
    ...data,
    SESSION_SECRET: data.SESSION_SECRET ?? DEFAULT_DEV_SESSION_SECRET,
  }));

export type Env = z.infer<typeof EnvSchema>;

/**
 * Parses and validates raw environment variables, failing fast on invalid configurations.
 *
 * @param rawEnv - Key-value map of environment variables.
 * @returns Fully validated and frozen environment object.
 */
export function parseEnv(rawEnv: Record<string, string | undefined>): Env {
  const parsed = EnvSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`❌ Environment validation failed:\n${issues}`);
  }

  return Object.freeze(parsed.data);
}

/**
 * Frozen, validated runtime environment configuration.
 */
export const env: Env = parseEnv(process.env);
