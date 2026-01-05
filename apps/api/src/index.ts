import 'dotenv/config';
console.log('DEBUG: GOOGLE_CLIENT_ID exists?', !!process.env.GOOGLE_CLIENT_ID);
console.log('DEBUG: BETTER_AUTH_SECRET exists?', !!process.env.BETTER_AUTH_SECRET);
console.log('DEBUG: DATABASE_URL exists?', !!process.env.DATABASE_URL);
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { 
  serializerCompiler, 
  validatorCompiler,
  ZodTypeProvider 
} from 'fastify-type-provider-zod';
import { db } from '@taskmanager/database';
import { authRoutes } from './routes/auth.js';
import { taskRoutes } from './routes/tasks.js';

const app = Fastify({ 
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
}).withTypeProvider<ZodTypeProvider>();

// Type Safety Config for Zod
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Decorate fastify with prisma instance
app.decorate('prisma', db);

// Register CORS
await app.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite default
    /^taskmanager:\/\//,     // Mobile deep link
    /^exp:\/\//,             // Expo development
  ],
  credentials: true,
});

// Register JWT
await app.register(jwt, { 
  secret: process.env.JWT_SECRET || 'super-secret-change-in-production' 
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
await app.register(authRoutes);
await app.register(taskRoutes, { prefix: '/v1/tasks' });

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    await app.close();
    await db.$disconnect();
    process.exit(0);
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  try {
    const userCount = await db.user.count();
    console.log('DEBUG: User count:', userCount);
  } catch (e) {
    console.error('DEBUG: DB Error:', e);
  }
};

start();

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof db;
  }
}
