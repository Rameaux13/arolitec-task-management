"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./task.entity");
const ioredis_1 = require("ioredis");
const email_service_1 = require("../notifications/email.service");
const users_service_1 = require("../users/users.service");
let TasksService = class TasksService {
    tasksRepository;
    redisClient;
    emailService;
    usersService;
    constructor(tasksRepository, redisClient, emailService, usersService) {
        this.tasksRepository = tasksRepository;
        this.redisClient = redisClient;
        this.emailService = emailService;
        this.usersService = usersService;
    }
    async create(createTaskDto, userId) {
        const task = this.tasksRepository.create({
            ...createTaskDto,
            userId,
        });
        const savedTask = await this.tasksRepository.save(task);
        if (savedTask.assignedToId) {
            const user = await this.usersService.findById(savedTask.assignedToId);
            if (user) {
                await this.emailService.sendTaskAssignmentEmail(user.email, `${user.firstName} ${user.lastName}`, savedTask.title, savedTask.description || '', savedTask.dueDate);
            }
        }
        await this.invalidateCache();
        return savedTask;
    }
    async findAll(page = 1, limit = 10, status, search) {
        const cacheKey = `tasks:page:${page}:limit:${limit}:status:${status || 'all'}:search:${search || 'none'}`;
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
            queryBuilder.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', { search: `%${search}%` });
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
        await this.redisClient.setex(cacheKey, 300, JSON.stringify(result));
        return result;
    }
    async findOne(id) {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['assignedTo'],
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async update(id, updateTaskDto) {
        const task = await this.findOne(id);
        const previousAssignedToId = task.assignedToId;
        Object.assign(task, updateTaskDto);
        const updatedTask = await this.tasksRepository.save(task);
        if (updateTaskDto.assignedToId && updateTaskDto.assignedToId !== previousAssignedToId) {
            const user = await this.usersService.findById(updateTaskDto.assignedToId);
            if (user) {
                await this.emailService.sendTaskAssignmentEmail(user.email, `${user.firstName} ${user.lastName}`, updatedTask.title, updatedTask.description || '', updatedTask.dueDate);
            }
        }
        await this.invalidateCache();
        return updatedTask;
    }
    async remove(id) {
        const task = await this.findOne(id);
        await this.tasksRepository.remove(task);
        await this.invalidateCache();
    }
    async assignTask(taskId, userId) {
        const task = await this.findOne(taskId);
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        task.assignedToId = userId;
        const updatedTask = await this.tasksRepository.save(task);
        await this.emailService.sendTaskAssignmentEmail(user.email, `${user.firstName} ${user.lastName}`, task.title, task.description || '', task.dueDate);
        await this.invalidateCache();
        return updatedTask;
    }
    async getTasksByUser(userId, page = 1, limit = 10, status, search) {
        const queryBuilder = this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.assignedTo', 'assignedUser')
            .leftJoinAndSelect('task.user', 'creator')
            .where('("task"."userId" = :userId OR "task"."assignedToId" = :userId)', { userId });
        if (status) {
            queryBuilder.andWhere('task.status = :status', { status });
        }
        if (search) {
            queryBuilder.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', { search: `%${search}%` });
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
    async invalidateCache() {
        const keys = await this.redisClient.keys('tasks:page:*');
        if (keys.length > 0) {
            await this.redisClient.del(...keys);
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ioredis_1.Redis,
        email_service_1.EmailService,
        users_service_1.UsersService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map