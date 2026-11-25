"use client";

import {
  CheckCircle2,
  Circle,
  Clock3,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskStatus } from "@/lib/tasks";

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

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

function isTaskStatus(value: string | null): value is TaskStatus {
  return value === "TODO" || value === "IN_PROGRESS" || value === "DONE";
}

type StatusSelectProps = {
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "default" | "lg";
  triggerVariant?: "status" | "plain";
};

export function StatusSelect({
  status,
  onStatusChange,
  id,
  ariaLabel,
  disabled = false,
  loading = false,
  fullWidth = false,
  size = "default",
  triggerVariant = "status",
}: StatusSelectProps) {
  const { icon: StatusIcon, label, className } = statusDetails[status];
  const DisplayIcon = loading ? LoaderCircle : StatusIcon;
  const triggerClassName =
    triggerVariant === "status"
      ? `${fullWidth ? "w-full" : "w-40"} gap-2 rounded-full px-3 text-xs font-medium ${className}`
      : fullWidth
        ? "w-full"
        : "w-40";

  return (
    <Select
      value={status}
      disabled={disabled}
      onValueChange={(value) => {
        if (isTaskStatus(value)) onStatusChange(value);
      }}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        size={size}
        className={triggerClassName}
      >
        <SelectValue>
          {triggerVariant === "status" ? (
            <span className="inline-flex items-center gap-1.5">
              <DisplayIcon
                aria-hidden="true"
                className={loading ? "size-3.5 animate-spin" : "size-3.5"}
              />
              {label}
            </span>
          ) : (
            label
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-40 px-1 py-2">
        {statusOptions.map((option) => {
          const { icon: OptionIcon, label: optionLabel } =
            statusDetails[option];
          return (
            <SelectItem key={option} value={option}>
              <OptionIcon aria-hidden="true" />
              {optionLabel}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
