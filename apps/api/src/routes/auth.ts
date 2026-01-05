import { FastifyPluginAsync } from 'fastify';
import { auth } from '@taskmanager/auth';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Mount Better-Auth handler
  fastify.all('/api/auth/*', async (request, reply) => {
    try {
      const res = await auth.handler(new Request(
        `${request.protocol}://${request.hostname}${request.url}`,
        {
          method: request.method,
          headers: new Headers(request.headers as any),
          body: request.body ? JSON.stringify(request.body) : undefined,
        }
      ));

      reply.status(res.status);
      res.headers.forEach((v, k) => reply.header(k, v));
      return reply.send(await res.text());
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Authentication error' });
    }
  });
};
