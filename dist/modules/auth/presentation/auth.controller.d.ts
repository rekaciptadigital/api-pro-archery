import { AuthService } from '../application/services/auth.service';
import { LoginDto, RegisterDto } from '../application/dtos/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../../users/domain/entities/user.entity").UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
