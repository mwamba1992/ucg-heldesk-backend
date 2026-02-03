import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/enums';
interface FindAllOptions {
    page?: number;
    limit?: number;
    role?: UserRole;
    isActive?: boolean;
}
export declare class UsersService {
    private readonly userRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>);
    seedAdminUser(): Promise<void>;
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(options?: FindAllOptions): Promise<{
        data: User[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
    findByUsernameWithPassword(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    deactivate(id: string): Promise<{
        message: string;
    }>;
}
export {};
