const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const API_BASE = "https://oauth.reddit.com";
const TOKEN_TTL_MS = 55 * 60 * 1000; // Reddit tokens last 60 min; refresh at 55

export class RedditError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "RedditError";
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new RedditError(`${name} is not set`);
  return v;
}

type TokenCache = { token: string; expiresAt: number };
let cache: TokenCache | null = null;

async function getToken(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt) return cache.token;

  const clientId = requireEnv("REDDIT_CLIENT_ID");
  const clientSecret = requireEnv("REDDIT_CLIENT_SECRET");
  const username = requireEnv("REDDIT_USERNAME");
  const password = requireEnv("REDDIT_PASSWORD");
  const userAgent = process.env.REDDIT_USER_AGENT ?? `reddit-mcp/1.0.0 by ${username}`;

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    },
    body: new URLSearchParams({
      grant_type: "password",
      username,
      password,
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new RedditError(`Reddit auth failed (${res.status}): ${text}`, res.status);
  }

  const data = (await res.json()) as { access_token: string; error?: string };
  if (data.error) throw new RedditError(`Reddit auth error: ${data.error}`);

  cache = { token: data.access_token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return cache.token;
}

export async function reddit<T = unknown>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, string>,
): Promise<T> {
  const token = await getToken();
  const username = process.env.REDDIT_USERNAME ?? "unknown";
  const userAgent = process.env.REDDIT_USER_AGENT ?? `reddit-mcp/1.0.0 by ${username}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body ? { body: new URLSearchParams(body).toString() } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new RedditError(`Reddit API error (${res.status}): ${text}`, res.status);
  }

  return (await res.json()) as T;
}

export function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function err(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return {
    isError: true,
    content: [{ type: "text" as const, text: `Error: ${msg}` }],
  };
}
