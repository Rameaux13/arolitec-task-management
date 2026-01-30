import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Task } from '../tasks/task.entity';
import * as amqp from 'amqplib';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private isConnected = false;

  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.connect();
    if (this.isConnected) {
      await this.setupQueue();
      this.startCheckingOverdueTasks();
    }
  }

  private async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      this.isConnected = true;
      console.log(' Connecté à RabbitMQ');
    } catch (error) {
      console.error('Erreur de connexion à RabbitMQ:', error.message);
      console.log(' L\'application continue sans RabbitMQ (notifications désactivées)');
      this.isConnected = false;
    }
  }

  private async setupQueue() {
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
          
          // Envoyer un email si la tâche est assignée
          if (taskData.assignedTo) {
            await this.emailService.sendOverdueTaskEmail(
              taskData.assignedTo.email,
              `${taskData.assignedTo.firstName} ${taskData.assignedTo.lastName}`,
              taskData.title,
              taskData.dueDate,
            );
          }
          
          this.channel.ack(msg);
        }
      });
    } catch (error) {
      console.error(' Erreur lors de la configuration de la queue:', error.message);
    }
  }

  private startCheckingOverdueTasks() {
    if (!this.isConnected) {
      return;
    }

    setInterval(async () => {
      await this.checkOverdueTasks();
    }, 60000); // Vérifie toutes les minutes
  }

  private async checkOverdueTasks() {
    if (!this.isConnected) {
      return;
    }

    try {
      const now = new Date();
      
      const overdueTasks = await this.tasksRepository.find({
        where: {
          dueDate: LessThan(now),
          status: 'pending',
        },
        relations: ['assignedTo'],
      });

      for (const task of overdueTasks) {
        await this.sendNotification(task);
      }
    } catch (error) {
      console.error(' Erreur lors de la vérification des tâches en retard:', error.message);
    }
  }

  private async sendNotification(task: Task) {
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

      this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );
    } catch (error) {
      console.error(' Erreur lors de l\'envoi de notification:', error.message);
    }
  }
}