import { User } from '../users/user.entity';
export declare class Task {
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: Date;
    user: User;
    userId: string;
    assignedTo: User;
    assignedToId: string;
    createdAt: Date;
    updatedAt: Date;
}
