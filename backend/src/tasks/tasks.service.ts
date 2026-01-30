import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { Redis } from 'ioredis';
import { EmailService } from '../notifications/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    private emailService: EmailService,
    private usersService: UsersService,
  ) { }

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
    });
    const savedTask = await this.tasksRepository.save(task);

    // Si la tâche est assignée lors de la création, envoyer un email
    if (savedTask.assignedToId) {
      const user = await this.usersService.findById(savedTask.assignedToId);
      if (user) {
        await this.emailService.sendTaskAssignmentEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          savedTask.title,
          savedTask.description || '',
          savedTask.dueDate,
        );
      }
    }

    // Invalider le cache après création
    await this.invalidateCache();

    return savedTask;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ): Promise<{ tasks: Task[]; total: number; page: number; totalPages: number }> {
    const cacheKey = `tasks:page:${page}:limit:${limit}:status:${status || 'all'}:search:${search || 'none'}`;

    // Vérifier le cache
    const cachedData = await this.redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const queryBuilder = this.tasksRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'user');

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [tasks, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('task.createdAt', 'DESC')
      .getManyAndCount();

    const result = {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    // Mettre en cache pour 5 minutes
    await this.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignedTo'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const previousAssignedToId = task.assignedToId;

    Object.assign(task, updateTaskDto);

    const updatedTask = await this.tasksRepository.save(task);

    // Si l'assignation a changé, envoyer un email
    if (updateTaskDto.assignedToId && updateTaskDto.assignedToId !== previousAssignedToId) {
      const user = await this.usersService.findById(updateTaskDto.assignedToId);
      if (user) {
        await this.emailService.sendTaskAssignmentEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          updatedTask.title,
          updatedTask.description || '',
          updatedTask.dueDate,
        );
      }
    }

    // Invalider le cache après mise à jour
    await this.invalidateCache();

    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);

    // Invalider le cache après suppression
    await this.invalidateCache();
  }

  async assignTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.findOne(taskId);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    task.assignedToId = userId;

    const updatedTask = await this.tasksRepository.save(task);

    // Envoyer un email de notification
    await this.emailService.sendTaskAssignmentEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      task.title,
      task.description || '',
      task.dueDate,
    );

    // Invalider le cache après assignation
    await this.invalidateCache();

    return updatedTask;
  }

  async getTasksByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ): Promise<{ tasks: Task[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.tasksRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedUser')
      .leftJoinAndSelect('task.user', 'creator')
      .where('("task"."userId" = :userId OR "task"."assignedToId" = :userId)', { userId });

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [tasks, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('task.createdAt', 'DESC')
      .getManyAndCount();

    return {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async invalidateCache(): Promise<void> {
    const keys = await this.redisClient.keys('tasks:page:*');
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}