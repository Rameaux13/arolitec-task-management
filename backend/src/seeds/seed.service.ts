import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  private async seedUsers() {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@arolitec.com' }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await this.userRepository.save({
        firstName: 'Admin',
        lastName: 'AROLITEC',
        email: 'admin@arolitec.com',
        password: hashedPassword,
        role: UserRole.ADMIN
      });

      
    }

    // Vérifier si l'user existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email: 'user@arolitec.com' }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      
      await this.userRepository.save({
        firstName: 'User',
        lastName: 'AROLITEC',
        email: 'user@arolitec.com',
        password: hashedPassword,
        role: UserRole.USER
      });

    }
  }
}