import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { Task, TaskStatus } from './task.model.js';

@Injectable()
export class TasksService {
  private readonly tasks = new Map<string, Task>();

  findAll(): Task[] {
    return Array.from(this.tasks.values(), (task) => ({ ...task }));
  }

  findOne(id: string): Task {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return { ...task };
  }

  create(dto: CreateTaskDto): Task {
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? undefined,
      status: dto.status ?? TaskStatus.TODO,
      dueDate: dto.dueDate ?? undefined,
      createdAt: new Date().toISOString(),
    };

    this.tasks.set(task.id, task);
    return { ...task };
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    const updatedTask: Task = {
      ...task,
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && {
        description: dto.description ?? undefined,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ?? undefined }),
    };

    this.tasks.set(id, updatedTask);
    return { ...updatedTask };
  }

  remove(id: string): void {
    this.findOne(id);
    this.tasks.delete(id);
  }
}
