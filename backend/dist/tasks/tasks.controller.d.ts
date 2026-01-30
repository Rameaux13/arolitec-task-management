import { TasksService } from './tasks.service';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: any): Promise<import("./task.entity").Task>;
    findAll(page?: string, limit?: string, status?: string, search?: string): Promise<{
        tasks: import("./task.entity").Task[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getMyTasks(req: any, page?: string, limit?: string, status?: string, search?: string): Promise<{
        tasks: import("./task.entity").Task[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("./task.entity").Task>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<import("./task.entity").Task>;
    remove(id: string): Promise<void>;
    assignTask(taskId: string, userId: string): Promise<import("./task.entity").Task>;
}
