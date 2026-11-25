import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Tasks API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates, lists, and retrieves tasks', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: '  Review assignment  ',
        description: 'Check the requirements',
        dueDate: '2026-11-25',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'Review assignment',
      description: 'Check the requirements',
      status: 'TODO',
      dueDate: '2026-11-25',
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect([response.body]);

    await request(app.getHttpServer())
      .get(`/tasks/${response.body.id}`)
      .expect(200)
      .expect(response.body);
  });

  it('rejects invalid task input', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '   ' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Review assignment', status: 'BLOCKED' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Review assignment', dueDate: 'not-a-date' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Review assignment', unexpected: true })
      .expect(400);
  });

  it('partially updates a task and clears optional fields', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Review assignment',
        description: 'Draft',
        dueDate: '2026-11-25',
      })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({ status: 'DONE' })
      .expect(200);

    expect(updated.body).toMatchObject({
      title: 'Review assignment',
      description: 'Draft',
      status: 'DONE',
      dueDate: '2026-11-25',
    });

    const cleared = await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({ description: null, dueDate: null })
      .expect(200);

    expect(cleared.body).not.toHaveProperty('description');
    expect(cleared.body).not.toHaveProperty('dueDate');
    expect(cleared.body.status).toBe('DONE');
  });

  it('returns 404 for missing task IDs', async () => {
    await request(app.getHttpServer()).get('/tasks/missing').expect(404);
    await request(app.getHttpServer())
      .patch('/tasks/missing')
      .send({ title: 'Updated' })
      .expect(404);
    await request(app.getHttpServer()).delete('/tasks/missing').expect(404);
  });

  it('deletes an existing task', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Review assignment' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/tasks/${created.body.id}`)
      .expect(204);

    await request(app.getHttpServer()).get('/tasks').expect(200, []);
  });
});
