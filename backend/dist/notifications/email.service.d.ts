export declare class EmailService {
    private transporter;
    constructor();
    sendTaskAssignmentEmail(userEmail: string, userName: string, taskTitle: string, taskDescription: string, dueDate?: Date): Promise<void>;
    sendOverdueTaskEmail(userEmail: string, userName: string, taskTitle: string, dueDate: Date): Promise<void>;
}
