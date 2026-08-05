import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type ApiFetch = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;

export const useApiClient = (): ApiFetch => {
  const { getToken } = useAuth();

  return useCallback(
    async <T = unknown>(path: string, init?: RequestInit): Promise<T> => {
      const token = await getToken();

      const res = await fetch(`${BACKEND_URL}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init?.headers,
        },
      });

      const isJson = res.headers.get("content-type")?.includes("application/json");
      const body = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const message =
          typeof body === "object" && body && "error" in body
            ? String((body as { error: unknown }).error)
            : res.statusText;
        throw new ApiError(message, res.status);
      }

      return body as T;
    },
    [getToken],
  );
};
