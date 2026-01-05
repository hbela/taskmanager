import { PrismaClient } from '@taskmanager/database';
import { Task, CreateTaskRequest } from '@taskmanager/shared';

export class TaskService {
  constructor(private prisma: PrismaClient) {}

  async getAll(userId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description ?? undefined,
      completed: t.status === 'DONE',
      dueDate: t.dueDate?.toISOString(),
      userId: t.userId
    }));
  }

  async getById(id: string, userId: string): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) return null;
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      completed: task.status === 'DONE',
      dueDate: task.dueDate?.toISOString(),
      userId: task.userId
    };
  }

  async create(userId: string, data: CreateTaskRequest): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        status: (data.completed ? 'DONE' : 'TODO'),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId,
        updatedAt: new Date(),
      },
    });
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      completed: task.status === 'DONE',
      dueDate: task.dueDate?.toISOString(),
      userId: task.userId
    };
  }

  async toggle(id: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({ 
      where: { id, userId } 
    });
    
    if (!task) {
      throw new Error('Task not found');
    }

    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: newStatus, updatedAt: new Date() },
    });
    
    return {
      id: updated.id,
      title: updated.title,
      description: updated.description ?? undefined,
      completed: updated.status === 'DONE',
      dueDate: updated.dueDate?.toISOString(),
      userId: updated.userId
    };
  }

  async update(id: string, userId: string, data: Partial<Task>): Promise<Task> {
    const task = await this.prisma.task.findFirst({ 
      where: { id, userId } 
    });
    
    if (!task) {
      throw new Error('Task not found');
    }

    const updateData: any = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.completed !== undefined) updateData.status = data.completed ? 'DONE' : 'TODO';
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updated = await this.prisma.task.update({
      where: { id },
      data: updateData,
    });
    
    return {
      id: updated.id,
      title: updated.title,
      description: updated.description ?? undefined,
      completed: updated.status === 'DONE',
      dueDate: updated.dueDate?.toISOString(),
      userId: updated.userId
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findFirst({ 
      where: { id, userId } 
    });
    
    if (!task) {
      throw new Error('Task not found');
    }

    await this.prisma.task.delete({
      where: { id },
    });
  }
}
