import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { TaskSchema, CreateTaskRequest, UpdateTaskRequest } from '@taskmanager/shared';
import { TaskService } from '../services/task.service.js';
import { z } from 'zod';

import { auth } from '@taskmanager/auth';

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  
  // Authentication middleware using Better-Auth
  // Supports both cookie-based auth (web) and Bearer token auth (mobile)
  app.addHook('preHandler', async (request, reply) => {
    // Extract token from Authorization header (mobile) or Cookie (web)
    const authHeader = request.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    // Parse cookies to get session token
    const cookieHeader = request.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const tokenFromCookie = cookies['better-auth.session_token'];

    // Prefer Bearer token (mobile), fallback to cookie (web)
    const token = tokenFromHeader ?? tokenFromCookie;

    console.log('Auth Debug:', {
      hasAuthHeader: !!authHeader,
      hasCookie: !!cookieHeader,
      tokenSource: tokenFromHeader ? 'Bearer' : tokenFromCookie ? 'Cookie' : 'None',
      tokenPreview: token?.substring(0, 20) + '...' || 'MISSING',
    });

    // Get session using the token
    let session = null;
    
    if (token) {
      try {
        // Query session directly from database using the token
        const sessionRecord = await app.prisma.session.findUnique({
          where: { token },
          include: { user: true },
        });

        if (sessionRecord && sessionRecord.expiresAt > new Date()) {
          // Session is valid and not expired
          session = {
            user: {
              id: sessionRecord.user.id,
              email: sessionRecord.user.email,
              name: sessionRecord.user.name,
              image: sessionRecord.user.image,
            },
            session: {
              token: sessionRecord.token,
              expiresAt: sessionRecord.expiresAt,
            },
          };
        }
      } catch (error) {
        console.error('Session lookup error:', error);
      }
    }

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
