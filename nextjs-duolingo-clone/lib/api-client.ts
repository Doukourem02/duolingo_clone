import { auth } from "@clerk/nextjs";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export const apiFetch = async <T = any>(path: string, init?: RequestInit): Promise<T> => {
  const { getToken } = auth();
  const token = await getToken();

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(
      typeof body === "object" && body && "error" in body ? String((body as { error: unknown }).error) : res.statusText,
      res.status,
      body,
    );
  }

  return body as T;
};
