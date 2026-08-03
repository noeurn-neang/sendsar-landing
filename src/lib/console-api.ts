import "server-only";

export class ConsoleApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ConsoleApiError";
    this.status = status;
  }
}

function baseUrl(): string {
  const url = process.env.CONSOLE_API_URL?.trim();
  if (!url) {
    throw new Error("CONSOLE_API_URL is not configured");
  }
  return url.replace(/\/$/, "");
}

function secret(): string {
  const value = process.env.CONSOLE_INTERNAL_SECRET?.trim();
  if (!value) {
    throw new Error("CONSOLE_INTERNAL_SECRET is not configured");
  }
  return value;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
  /** When true, 204/404 return null instead of throwing. */
  allowEmpty?: boolean;
  /** Override default 60s abort. Soft dashboard reads use a shorter budget. */
  timeoutMs?: number;
};

export async function consoleFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const timeoutMs = options.timeoutMs ?? 60_000;
  const response = await fetch(url, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      "x-console-secret": secret(),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((cause: unknown) => {
    const hint =
      cause instanceof Error && cause.name === "TimeoutError"
        ? `Console API timed out after ${timeoutMs}ms (check gateway logs — slow DB queries?)`
        : `Console API unreachable at ${url.origin} (is gateway-go running on CONSOLE_API_URL?)`;
    throw new ConsoleApiError(0, hint);
  });

  if (options.allowEmpty && (response.status === 204 || response.status === 404)) {
    return null as T;
  }

  if (!response.ok) {
    let message = `Console API ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) message = payload.message;
    } catch {
      // ignore
    }
    throw new ConsoleApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
