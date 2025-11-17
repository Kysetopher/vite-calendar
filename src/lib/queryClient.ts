import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authService } from "../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function withBase(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }
  return `${API_BASE_URL}/${url}`;
}

async function fetchWithAuthRefresh(
  url: string,
  options: RequestInit,
  attemptRefresh = true,
): Promise<Response> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (res.status === 401 && attemptRefresh) {
    const refreshed = await authService.refreshAccessToken();
    if (refreshed) {
      return fetchWithAuthRefresh(url, options, false);
    }
  }
  return res;
}
export { fetchWithAuthRefresh };

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const headers: Record<string, string> = data
    ? { "Content-Type": "application/json" }
    : {};

  const res = await fetchWithAuthRefresh(withBase(url), {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  if (res.status === 204) return null;
  const json = await res.json();
  return json;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};

    const res = await fetchWithAuthRefresh(withBase(queryKey[0] as string), {
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    return data as any;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
