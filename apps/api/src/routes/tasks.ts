import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { TaskSchema, CreateTaskRequest, UpdateTaskRequest } from '@taskmanager/shared';
import { TaskService } from '../services/task.service.js';
import { z } from 'zod';

import { auth } from '@taskmanager/auth';

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  
  // Authentication middleware using Better-Auth
  app.addHook('preHandler', async (request, reply) => {
    // Debug logging - parse cookies
    const cookieHeader = request.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    console.log('Auth Debug:', {
      authorization: request.headers.authorization,
      rawCookie: cookieHeader,
      parsedCookies: Object.keys(cookies),
      sessionToken: cookies['better-auth.session_token'] || 'MISSING',
    });

    const session = await auth.api.getSession({
      headers: new Headers(request.headers as any) // Convert Fastify headers to standard Headers
    });

    console.log('Session Result:', session ? { userId: session.user.id, email: session.user.email } : 'NULL');

    if (!session) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }

    // Attach user to request for downstream handlers
    (request as any).user = session.user;
  });

  const taskService = new TaskService(app.prisma);

  // GET /v1/tasks - Get all tasks for the authenticated user
  app.get('/', {
    schema: {
      response: {
        200: z.array(TaskSchema),
      },
    },
  }, async (request) => {
    const userId = (request.user as any).id;
    return await taskService.getAll(userId);
  });

  // GET /v1/tasks/:id - Get a single task
  app.get('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: TaskSchema,
      },
    },
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };
    
    const task = await taskService.getById(id, userId);
    
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }
    
    return task;
  });

  // POST /v1/tasks - Create a new task
  app.post('/', {
    schema: {
      body: CreateTaskRequest,
      response: {
        201: TaskSchema,
      },
    },
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const task = await taskService.create(userId, request.body);
    return reply.code(201).send(task);
  });

  // PATCH /v1/tasks/:id/toggle - Toggle task completion
  app.patch('/:id/toggle', {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: TaskSchema,
      },
    },
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };
    
    try {
      const task = await taskService.toggle(id, userId);
      return task;
    } catch (error) {
      return reply.code(404).send({ error: 'Task not found' });
    }
  });

  // PATCH /v1/tasks/:id - Update a task
  app.patch('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: UpdateTaskRequest,
      response: {
        200: TaskSchema,
      },
    },
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };
    
    try {
      const task = await taskService.update(id, userId, request.body);
      return task;
    } catch (error) {
      return reply.code(404).send({ error: 'Task not found' });
    }
  });

  // DELETE /v1/tasks/:id - Delete a task
  app.delete('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        204: z.void(),
      },
    },
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };
    
    try {
      await taskService.delete(id, userId);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ error: 'Task not found' });
    }
  });
};
