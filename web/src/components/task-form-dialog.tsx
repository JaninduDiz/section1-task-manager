"use client";

import { format, parseISO } from "date-fns";
import { CalendarDays, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { StatusSelect } from "@/components/status-select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import type { Task, TaskInput, TaskStatus } from "@/lib/tasks";

type TaskFormDialogProps = {
  open: boolean;
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: TaskInput, taskId?: string) => Promise<void>;
};

export function TaskFormDialog({
  open,
  task,
  onOpenChange,
  onSave,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) ?? "");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave(
        {
          title: title.trim(),
          description: description.trim() || null,
          status,
          dueDate: dueDate || null,
        },
        task?.id,
      );
      onOpenChange(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The task could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedDate = dueDate ? parseISO(dueDate) : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && saving) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl">
              {task ? "Edit task" : "Create a task"}
            </DialogTitle>
            <DialogDescription>
              {task
                ? "Update the details for this task."
                : "Add a task to keep your work organized."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="task-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                autoFocus
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Prepare project proposal"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a few details..."
                rows={3}
                className="min-h-24 resize-y"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <StatusSelect
                  id="task-status"
                  status={status}
                  onStatusChange={setStatus}
                  disabled={saving}
                  fullWidth
                  size="lg"
                  triggerVariant="plain"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-due-date">
                  Due date <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        id="task-due-date"
                        type="button"
                        variant="outline"
                        aria-label={
                          selectedDate
                            ? `Due date: ${format(selectedDate, "PPP")}`
                            : "Choose due date"
                        }
                        className="h-10 w-full justify-start gap-2 font-normal"
                      />
                    }
                  >
                    <CalendarDays aria-hidden="true" className="text-muted-foreground" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      defaultMonth={selectedDate}
                      onSelect={(date) => {
                        setDueDate(date ? format(date, "yyyy-MM-dd") : "");
                        setCalendarOpen(false);
                      }}
                    />
                    {dueDate && (
                      <div className="border-t p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setDueDate("");
                            setCalendarOpen(false);
                          }}
                        >
                          Clear date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Unable to save task</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="mt-7">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !title.trim()}
            >
              {saving && <LoaderCircle className="animate-spin" />}
              {task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
