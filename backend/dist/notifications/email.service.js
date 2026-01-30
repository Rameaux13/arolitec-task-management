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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
            port: parseInt(process.env.SMTP_PORT || '2525'),
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });
    }
    async sendTaskAssignmentEmail(userEmail, userName, taskTitle, taskDescription, dueDate) {
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
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
        }
    }
    async sendOverdueTaskEmail(userEmail, userName, taskTitle, dueDate) {
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
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de retard:', error);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map