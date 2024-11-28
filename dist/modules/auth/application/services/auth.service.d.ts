import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: UserRepository, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../../../users/domain/entities/user.entity").UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
