type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
const apiBaseUrl = rawBaseUrl.replace(/\/$/, "");

function buildApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    return `${apiBaseUrl}/${path}`;
  }
  return `${apiBaseUrl}${path}`;
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { detail?: string; message?: string };
    return payload.detail ?? payload.message ?? `Request failed with status ${response.status}`;
  }

  const text = await response.text();
  return text || `Request failed with status ${response.status}`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers();
  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(options.body);
  }

  // Add 10 second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    let response: Response;
    try {
      response = await fetch(buildApiUrl(path), { ...init, signal: controller.signal });
    } catch (error) {
      const target = buildApiUrl(path);
      const hint = apiBaseUrl
        ? `Check that \`${apiBaseUrl}\` is reachable and accepts requests.`
        : "If you're running `npm run preview`, there is no dev proxy; set `VITE_API_BASE_URL` or use `npm run dev`.";

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(`Request timed out after 10s: ${target}. ${hint}`, 408);
      }

      throw new ApiError(`Network error while calling ${target}. ${hint}`, 0);
    }
    if (!response.ok) {
      throw new ApiError(await readErrorMessage(response), response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
