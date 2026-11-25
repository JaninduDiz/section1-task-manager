export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
};

export type TaskInput = {
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");

  try {
    return await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to reach the API. Check that the backend is running.",
        { cause: error },
      );
    }
    throw error;
  }
}

function getErrorMessage(body: string, status: number): string {
  if (body) {
    try {
      const payload: unknown = JSON.parse(body);
      if (typeof payload === "object" && payload !== null && "message" in payload) {
        const { message } = payload;
        if (typeof message === "string") return message;
        if (
          Array.isArray(message) &&
          message.every((entry): entry is string => typeof entry === "string")
        ) {
          return message.join(" ");
        }
      }
    } catch {
      return body;
    }
  }
  return `Request failed with status ${status}.`;
}

async function ensureSuccess(response: Response): Promise<void> {
  if (response.ok) return;
  const body = await response.text();
  throw new Error(getErrorMessage(body, response.status));
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchApi(path, init);
  await ensureSuccess(response);
  return (await response.json()) as T;
}

export function getTasks(signal?: AbortSignal): Promise<Task[]> {
  return requestJson<Task[]>("/tasks", { signal });
}

export function createTask(input: TaskInput): Promise<Task> {
  return requestJson<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTask(id: string, input: TaskInput): Promise<Task> {
  return requestJson<Task>(`/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetchApi(`/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await ensureSuccess(response);
}
