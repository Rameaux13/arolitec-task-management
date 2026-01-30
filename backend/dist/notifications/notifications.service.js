"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../tasks/task.entity");
const amqp = __importStar(require("amqplib"));
const email_service_1 = require("./email.service");
let NotificationsService = class NotificationsService {
    tasksRepository;
    emailService;
    connection;
    channel;
    isConnected = false;
    constructor(tasksRepository, emailService) {
        this.tasksRepository = tasksRepository;
        this.emailService = emailService;
    }
    async onModuleInit() {
        await this.connect();
        if (this.isConnected) {
            await this.setupQueue();
            this.startCheckingOverdueTasks();
        }
    }
    async connect() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            this.isConnected = true;
            console.log(' Connecté à RabbitMQ');
        }
        catch (error) {
            console.error('Erreur de connexion à RabbitMQ:', error.message);
            console.log(' L\'application continue sans RabbitMQ (notifications désactivées)');
            this.isConnected = false;
        }
    }
    async setupQueue() {
        if (!this.isConnected || !this.channel) {
            return;
        }
        try {
            const queueName = 'overdue_tasks';
            await this.channel.assertQueue(queueName, { durable: true });
            this.channel.consume(queueName, async (msg) => {
                if (msg) {
                    const taskData = JSON.parse(msg.content.toString());
                    console.log(` Notification reçue pour tâche en retard: ${taskData.title}`);
                    if (taskData.assignedTo) {
                        await this.emailService.sendOverdueTaskEmail(taskData.assignedTo.email, `${taskData.assignedTo.firstName} ${taskData.assignedTo.lastName}`, taskData.title, taskData.dueDate);
                    }
                    this.channel.ack(msg);
                }
            });
        }
        catch (error) {
            console.error(' Erreur lors de la configuration de la queue:', error.message);
        }
    }
    startCheckingOverdueTasks() {
        if (!this.isConnected) {
            return;
        }
        setInterval(async () => {
            await this.checkOverdueTasks();
        }, 60000);
    }
    async checkOverdueTasks() {
        if (!this.isConnected) {
            return;
        }
        try {
            const now = new Date();
            const overdueTasks = await this.tasksRepository.find({
                where: {
                    dueDate: (0, typeorm_2.LessThan)(now),
                    status: 'pending',
                },
                relations: ['assignedTo'],
            });
            for (const task of overdueTasks) {
                await this.sendNotification(task);
            }
        }
        catch (error) {
            console.error(' Erreur lors de la vérification des tâches en retard:', error.message);
        }
    }
    async sendNotification(task) {
        if (!this.isConnected || !this.channel) {
            return;
        }
        try {
            const queueName = 'overdue_tasks';
            const message = {
                id: task.id,
                title: task.title,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo ? {
                    email: task.assignedTo.email,
                    firstName: task.assignedTo.firstName,
                    lastName: task.assignedTo.lastName,
                } : null,
            };
            this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        }
        catch (error) {
            console.error(' Erreur lors de l\'envoi de notification:', error.message);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        email_service_1.EmailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map