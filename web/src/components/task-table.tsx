"use client";

import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
};

const statusDetails: Record<
  TaskStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  TODO: {
    label: "To do",
    icon: Circle,
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
  IN_PROGRESS: {
    label: "In progress",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  },
  DONE: {
    label: "Done",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
};

function formatTaskDate(value: string, dateOnly = false): string {
  const date = dateOnly
    ? parseISO(`${value.slice(0, 10)}T12:00:00`)
    : parseISO(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy");
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const { icon: StatusIcon, label, className } = statusDetails[status];

  return (
    <Badge variant="outline" className={className}>
      <StatusIcon aria-hidden="true" />
      {label}
    </Badge>
  );
}

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
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
              <StatusBadge status={task.status} />
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
                  onClick={() => onEdit(task)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${task.title}`}
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
