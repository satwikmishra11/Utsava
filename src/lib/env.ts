import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  LLM_PROVIDER: z.enum(['claude', 'gemini', 'mock']).default('mock'),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

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

export const env: Env = parseEnv(process.env);
