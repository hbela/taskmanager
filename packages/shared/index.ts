import { z } from 'zod';

// Task Schema
export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  completed: z.boolean().default(false),
  userId: z.string()
});

export type Task = z.infer<typeof TaskSchema>;

// User Schema (for Better-Auth integration)
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
});

export type User = z.infer<typeof UserSchema>;

// API Request/Response types
export const CreateTaskRequest = TaskSchema.omit({ id: true, userId: true });
export const UpdateTaskRequest = TaskSchema.partial().omit({ userId: true });

export type CreateTaskRequest = z.infer<typeof CreateTaskRequest>;
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequest>;
