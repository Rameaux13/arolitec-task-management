import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Configuration du transporteur email (utilise Mailtrap pour les tests)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525'),
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendTaskAssignmentEmail(
    userEmail: string,
    userName: string,
    taskTitle: string,
    taskDescription: string,
    dueDate?: Date,
  ): Promise<void> {
    const dueDateText = dueDate
      ? `<p><strong>Date limite :</strong> ${new Date(dueDate).toLocaleDateString('fr-FR')}</p>`
      : '';

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@arolitec.com',
      to: userEmail,
      subject: `Nouvelle tâche assignée : ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Nouvelle tâche assignée</h2>
          <p>Bonjour <strong>${userName}</strong>,</p>
          <p>Une nouvelle tâche vous a été assignée :</p>
          <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">${taskTitle}</h3>
            <p style="color: #64748B;">${taskDescription || 'Pas de description'}</p>
            ${dueDateText}
          </div>
          <p>Connectez-vous à l'application pour voir les détails.</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;">
          <p style="color: #94A3B8; font-size: 12px;">AROLITEC - Gestion de tâches</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email envoyé à ${userEmail} pour la tâche "${taskTitle}"`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
  }

  async sendOverdueTaskEmail(
    userEmail: string,
    userName: string,
    taskTitle: string,
    dueDate: Date,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@arolitec.com',
      to: userEmail,
      subject: ` Tâche en retard : ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Tâche en retard</h2>
          <p>Bonjour <strong>${userName}</strong>,</p>
          <p>La tâche suivante a dépassé sa date limite :</p>
          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <h3 style="color: #1E293B; margin-top: 0;">${taskTitle}</h3>
            <p style="color: #EF4444;"><strong>Date limite dépassée :</strong> ${new Date(dueDate).toLocaleDateString('fr-FR')}</p>
          </div>
          <p>Veuillez mettre à jour le statut de cette tâche.</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;">
          <p style="color: #94A3B8; font-size: 12px;">AROLITEC - Gestion de tâches</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de retard envoyé à ${userEmail} pour "${taskTitle}"`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de retard:', error);
    }
  }
}