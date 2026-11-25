import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TaskStatus } from './task.model.js';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  it('creates a task with default status and generated fields', () => {
    const task = service.create({ title: 'Review assignment' });

    expect(task).toMatchObject({
      title: 'Review assignment',
      status: TaskStatus.TODO,
    });
    expect(task.id).toBeTruthy();
    expect(task.createdAt).toEqual(expect.any(String));
    expect(service.findAll()).toEqual([task]);
  });

  it('updates supplied fields and allows clearing optional fields', () => {
    const task = service.create({
      title: 'Review assignment',
      description: 'Draft',
      dueDate: '2026-11-25',
    });

    const updatedTask = service.update(task.id, {
      status: TaskStatus.DONE,
      description: null,
      dueDate: null,
    });

    expect(updatedTask).toMatchObject({
      id: task.id,
      title: 'Review assignment',
      status: TaskStatus.DONE,
    });
    expect(updatedTask.description).toBeUndefined();
    expect(updatedTask.dueDate).toBeUndefined();
  });

  it('throws NotFoundException for missing tasks', () => {
    expect(() => service.findOne('missing')).toThrow(NotFoundException);
    expect(() => service.update('missing', {})).toThrow(NotFoundException);
    expect(() => service.remove('missing')).toThrow(NotFoundException);
  });
});
