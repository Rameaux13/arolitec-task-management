import { Repository } from 'typeorm';
import { Task } from './tasks/task.entity';
export declare class NotificationsService {
    private tasksRepository;
    private connection;
    private channel;
    constructor(tasksRepository: Repository<Task>);
    onModuleInit(): Promise<void>;
    private startNotificationCheck;
    checkOverdueTasks(): Promise<void>;
    sendNotification(task: Task): Promise<void>;
    private simulateEmailSend;
    onModuleDestroy(): Promise<void>;
}
