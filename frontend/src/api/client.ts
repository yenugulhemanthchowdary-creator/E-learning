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

  const response = await fetch(buildApiUrl(path), init);
  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
