import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
export interface JwtPayload {
    sub: string;
    username: string;
    email: string;
    role: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: Partial<User>;
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateUser(username: string, password: string): Promise<User | null>;
    login(user: User): Promise<TokenResponse>;
    refreshToken(refreshToken: string): Promise<TokenResponse>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<Partial<User>>;
}
