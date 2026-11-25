"use client";

import {
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Clock3,
  ListTodo,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskTable } from "@/components/task-table";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "@/lib/tasks";
import type { Task, TaskInput, TaskStatus } from "@/lib/tasks";

type StatusFilter = "ALL" | TaskStatus;

function isStatusFilter(value: string | null): value is StatusFilter {
  return (
    value === "ALL" ||
    value === "TODO" ||
    value === "IN_PROGRESS" ||
    value === "DONE"
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
}) {
  return (
    <Card className="shadow-sm transition-colors duration-500 motion-reduce:transition-none">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function TaskTableSkeleton() {
  return (
    <div role="status" aria-label="Loading tasks" className="space-y-4 p-5">
      <span className="sr-only">Loading tasks</span>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-[minmax(160px,2fr)_1fr_1fr_auto] items-center gap-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      setLoading(true);
      setLoadError(null);
      try {
        setTasks(await getTasks(controller.signal));
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(errorMessage(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTasks();
    return () => controller.abort();
  }, [reloadKey]);

  const counts = useMemo(
    () => ({
      total: tasks.length,
      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      completed: tasks.filter((task) => task.status === "DONE").length,
    }),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, tasks]);

  function openCreateDialog() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEditDialog(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  async function saveTask(input: TaskInput, taskId?: string): Promise<void> {
    if (taskId) {
      const updatedTask = await updateTask(taskId, input);
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updatedTask : task)),
      );
      toast.success("Task updated", {
        description: "Your changes have been saved.",
      });
      return;
    }

    const createdTask = await createTask(input);
    setTasks((current) => [...current, createdTask]);
    toast.success("Task created", {
      description: "Your new task is ready.",
    });
  }

  async function changeTaskStatus(
    task: Task,
    status: TaskStatus,
  ): Promise<void> {
    if (task.status === status) return;

    setUpdatingTaskIds((current) => new Set(current).add(task.id));
    try {
      const updatedTask = await updateTask(task.id, {
        title: task.title,
        description: task.description ?? null,
        status,
        dueDate: task.dueDate?.slice(0, 10) ?? null,
      });
      setTasks((current) =>
        current.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask,
        ),
      );
      toast.success("Task status updated", {
        description: "Your change has been saved.",
      });
    } catch (error) {
      toast.error("Could not update task status", {
        description: errorMessage(error),
      });
    } finally {
      setUpdatingTaskIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!taskToDelete) return;
    setDeletingTaskId(taskToDelete.id);
    try {
      await deleteTask(taskToDelete.id);
      setTasks((current) =>
        current.filter((task) => task.id !== taskToDelete.id),
      );
      setTaskToDelete(null);
      toast.success("Task deleted", {
        description: "The task was removed from your list.",
      });
    } catch (error) {
      toast.error("Could not delete task", {
        description: errorMessage(error),
      });
    } finally {
      setDeletingTaskId(null);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 transition-colors duration-500 motion-reduce:transition-none">
      <header className="border-b bg-background transition-colors duration-500 motion-reduce:transition-none">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ListTodo aria-hidden="true" className="size-5" />
            </span>
            <span className="font-semibold tracking-tight">Task Manager</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Your workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Tasks, in focus.
            </h1>
            <p className="mt-2 text-muted-foreground">
              Plan your work and keep track of what matters.
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="h-10 gap-2"
            onClick={openCreateDialog}
          >
            <Plus aria-hidden="true" />
            New task
          </Button>
        </section>

        <section
          className="grid gap-3 sm:grid-cols-3"
          aria-label="Task summary"
        >
          <SummaryCard
            label="Total tasks"
            value={counts.total}
            icon={ClipboardList}
            iconClassName="bg-primary/10 text-primary"
          />
          <SummaryCard
            label="In progress"
            value={counts.inProgress}
            icon={Clock3}
            iconClassName="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          />
          <SummaryCard
            label="Completed"
            value={counts.completed}
            icon={CheckCircle2}
            iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          />
        </section>

        <Card className="shadow-sm transition-colors duration-500 motion-reduce:transition-none">
          <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>All tasks</CardTitle>
              <CardDescription>
                Review, update, and organize your task list.
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Label htmlFor="task-search" className="sr-only">
                  Search tasks by title
                </Label>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="task-search"
                  type="search"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 pl-9"
                />
              </div>
              <Label htmlFor="status-filter" className="sr-only">
                Filter tasks by status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (isStatusFilter(value)) setStatusFilter(value);
                }}
              >
                <SelectTrigger
                  id="status-filter"
                  size="lg"
                  className="w-full sm:w-40"
                >
                  <SelectValue>
                    {statusFilter === "ALL"
                      ? "All statuses"
                      : statusFilter === "TODO"
                        ? "To do"
                        : statusFilter === "IN_PROGRESS"
                          ? "In progress"
                          : "Done"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="TODO">To do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <TaskTableSkeleton />
            ) : loadError ? (
              <div className="p-5 sm:p-6">
                <Alert variant="destructive">
                  <CircleAlert aria-hidden="true" />
                  <AlertTitle>We couldn&apos;t load your tasks</AlertTitle>
                  <AlertDescription className="mt-1">
                    {loadError}
                  </AlertDescription>
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setReloadKey((key) => key + 1)}
                    >
                      <RefreshCw aria-hidden="true" />
                      Try again
                    </Button>
                  </div>
                </Alert>
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <ClipboardList aria-hidden="true" className="size-6" />
                </span>
                <h2 className="font-medium">
                  {tasks.length === 0
                    ? "Your task list is empty"
                    : "No tasks match these filters"}
                </h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {tasks.length === 0
                    ? "Create your first task to get started."
                    : "Try changing the search or status filter."}
                </p>
                {tasks.length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={openCreateDialog}
                  >
                    <Plus aria-hidden="true" />
                    Create a task
                  </Button>
                )}
              </div>
            ) : (
              <TaskTable
                tasks={visibleTasks}
                onEdit={openEditDialog}
                onDelete={setTaskToDelete}
                onStatusChange={changeTaskStatus}
                updatingTaskIds={updatingTaskIds}
              />
            )}
          </CardContent>

          {!loading && !loadError && visibleTasks.length > 0 && (
            <CardFooter className="justify-between gap-2 text-sm text-muted-foreground">
              <span>
                Showing {visibleTasks.length} of {tasks.length} tasks
              </span>
              {search || statusFilter !== "ALL" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </CardFooter>
          )}
        </Card>
      </main>

      <TaskFormDialog
        key={`${formOpen}-${editingTask?.id ?? "new"}`}
        open={formOpen}
        task={editingTask}
        onOpenChange={setFormOpen}
        onSave={saveTask}
      />

      <AlertDialog
        open={Boolean(taskToDelete)}
        onOpenChange={(open) => {
          if (!open && deletingTaskId === null) setTaskToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete?.title} will be permanently removed. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTaskId !== null}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deletingTaskId !== null}
              onClick={() => void confirmDelete()}
            >
              {deletingTaskId !== null && (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              )}
              Delete task
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
