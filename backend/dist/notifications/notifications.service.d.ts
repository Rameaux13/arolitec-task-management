import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { EmailService } from './email.service';
export declare class NotificationsService implements OnModuleInit {
    private tasksRepository;
    private emailService;
    private connection;
    private channel;
    private isConnected;
    constructor(tasksRepository: Repository<Task>, emailService: EmailService);
    onModuleInit(): Promise<void>;
    private connect;
    private setupQueue;
    private startCheckingOverdueTasks;
    private checkOverdueTasks;
    private sendNotification;
}
