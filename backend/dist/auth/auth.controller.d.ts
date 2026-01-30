import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/create-user.dto';
import { LoginDto } from './login.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
        };
    }>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
    }>;
    getAllUsers(): Promise<import("../users/user.entity").User[]>;
}
