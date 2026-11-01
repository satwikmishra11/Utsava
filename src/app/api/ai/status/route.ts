import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { resolveProviderName } from '@/services/llm/resolveProvider';
import { enforceRateLimit } from '@/app/api/helpers';
import { getSessionUser } from '@/services/auth/session';

export const maxDuration = 60;

function resolveStatusModel(provider: string): string | undefined {
  if (provider === 'gemini') return env.GEMINI_MODEL;
  if (provider === 'claude') return env.ANTHROPIC_MODEL;
  return undefined;
}

/**
 * Health check endpoint reporting active AI provider status and model configuration.
 * Never exposes API keys or secrets.
 *
 * @param req - Incoming HTTP request.
 * @returns Status response containing provider, live status, and model identifier.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const sessionUser = await getSessionUser(req);
  const rateLimitResponse = enforceRateLimit(req, sessionUser?.id);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const resolution = resolveProviderName(env);
    const live = resolution.name !== 'mock';
    const model = resolveStatusModel(resolution.name);

    return NextResponse.json(
      {
        provider: resolution.name,
        live,
        ...(model ? { model } : {}),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Provider unconfigured';
    return NextResponse.json(
      {
        provider: 'unconfigured',
        live: false,
        error: message,
      },
      { status: 200 }
    );
  }
}
