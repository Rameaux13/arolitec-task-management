import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Task } from './tasks/task.entity';
import * as amqp from 'amqplib';

@Injectable()
export class NotificationsService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  // Connexion à RabbitMQ au démarrage
  async onModuleInit() {
    try {
      this.connection = await amqp.connect('amqp://user:password@localhost:5672');
      this.channel = await this.connection.createChannel();
      
      // Créer la queue pour les notifications
      await this.channel.assertQueue('task_notifications', { durable: true });
      
      console.log(' Connecté à RabbitMQ');
      
      // Démarrer la vérification des tâches en retard
      this.startNotificationCheck();
    } catch (error) {
      console.error(' Erreur connexion RabbitMQ:', error);
    }
  }

  // Vérifier les tâches en retard toutes les minutes
  private startNotificationCheck() {
    setInterval(async () => {
      await this.checkOverdueTasks();
    }, 60000); // 60 secondes
  }

  // Chercher les tâches avec échéances dépassées
  async checkOverdueTasks() {
    const now = new Date();
    
    // Trouver les tâches dont la date limite est dépassée et le statut n'est pas "completed"
    const overdueTasks = await this.tasksRepository.find({
      where: {
        dueDate: LessThan(now),
        status: 'pending', // Seulement les tâches non terminées
      },
    });

    if (overdueTasks.length > 0) {
      console.log(` ${overdueTasks.length} tâche(s) en retard détectée(s)`);
      
      // Envoyer chaque tâche en retard dans la queue
      for (const task of overdueTasks) {
        await this.sendNotification(task);
      }
    }
  }

  // Envoyer une notification dans RabbitMQ
  async sendNotification(task: Task) {
    const notification = {
      taskId: task.id,
      title: task.title,
      dueDate: task.dueDate,
      message: `La tâche "${task.title}" a dépassé son échéance !`,
      timestamp: new Date(),
    };

    // Publier dans la queue RabbitMQ
    this.channel.sendToQueue(
      'task_notifications',
      Buffer.from(JSON.stringify(notification)),
      { persistent: true }
    );

    console.log(` Notification envoyée pour la tâche: ${task.title}`);
    
    // Simulation d'envoi d'email
    this.simulateEmailSend(notification);
  }

  // Simuler l'envoi d'email (pour le test)
  private simulateEmailSend(notification: any) {
    console.log(` [EMAIL SIMULÉ] Destinataire: user@example.com`);
    console.log(`   Sujet: Tâche en retard - ${notification.title}`);
    console.log(`   Message: ${notification.message}`);
  }

  // Fermer la connexion proprement
  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}