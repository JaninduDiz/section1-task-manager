"use client";

import { format, parseISO } from "date-fns";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { StatusSelect } from "@/components/status-select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task, TaskStatus } from "@/lib/tasks";

type TaskTableProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => Promise<void>;
  updatingTaskIds: ReadonlySet<string>;
};

function formatTaskDate(value: string, dateOnly = false): string {
  const date = dateOnly
    ? parseISO(`${value.slice(0, 10)}T12:00:00`)
    : parseISO(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy");
}

export function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  updatingTaskIds,
}: TaskTableProps) {
  return (
    <Table className="min-w-[620px]">
      <TableCaption className="sr-only">Task list</TableCaption>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-5">Task</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due date</TableHead>
          <TableHead className="hidden sm:table-cell">Created</TableHead>
          <TableHead className="pr-5 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="max-w-[360px] py-4 pl-5">
              <div className="min-w-0">
                <p className="truncate font-medium">{task.title}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {task.description || "No description"}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <StatusSelect
                status={task.status}
                ariaLabel={`Change status for ${task.title}`}
                disabled={updatingTaskIds.has(task.id)}
                loading={updatingTaskIds.has(task.id)}
                onStatusChange={(status) => {
                  void onStatusChange(task, status);
                }}
              />
            </TableCell>
            <TableCell>
              {task.dueDate ? (
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <CalendarDays
                    aria-hidden="true"
                    className="size-3.5 text-muted-foreground"
                  />
                  {formatTaskDate(task.dueDate, true)}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No date</span>
              )}
            </TableCell>
            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
              {formatTaskDate(task.createdAt)}
            </TableCell>
            <TableCell className="pr-5">
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${task.title}`}
                  disabled={updatingTaskIds.has(task.id)}
                  onClick={() => onEdit(task)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${task.title}`}
                  disabled={updatingTaskIds.has(task.id)}
                  onClick={() => onDelete(task)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
