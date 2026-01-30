import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { Redis } from 'ioredis';
import { EmailService } from '../notifications/email.service';
import { UsersService } from '../users/users.service';
export declare class TasksService {
    private tasksRepository;
    private readonly redisClient;
    private emailService;
    private usersService;
    constructor(tasksRepository: Repository<Task>, redisClient: Redis, emailService: EmailService, usersService: UsersService);
    create(createTaskDto: CreateTaskDto, userId: string): Promise<Task>;
    findAll(page?: number, limit?: number, status?: string, search?: string): Promise<{
        tasks: Task[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task>;
    remove(id: string): Promise<void>;
    assignTask(taskId: string, userId: string): Promise<Task>;
    getTasksByUser(userId: string, page?: number, limit?: number, status?: string, search?: string): Promise<{
        tasks: Task[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    private invalidateCache;
}
