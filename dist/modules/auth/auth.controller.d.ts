import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, user: User): Promise<import("./auth.service").TokenResponse>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<import("./auth.service").TokenResponse>;
    logout(user: User): Promise<{
        message: string;
    }>;
    getProfile(user: User): Promise<Partial<User>>;
}
