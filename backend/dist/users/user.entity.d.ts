import { Task } from '../tasks/task.entity';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
}
