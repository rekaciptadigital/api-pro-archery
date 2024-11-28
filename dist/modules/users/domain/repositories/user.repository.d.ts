import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UserRepository {
    private readonly repository;
    constructor(repository: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    create(user: Partial<User>): Promise<User>;
    findById(id: string): Promise<User | null>;
}
