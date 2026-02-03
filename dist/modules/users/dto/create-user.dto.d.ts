import { UserRole } from '../../../common/enums';
export declare class CreateUserDto {
    username: string;
    email: string;
    fullName: string;
    password: string;
    role?: UserRole;
    department?: string;
    location?: string;
    ldapDn?: string;
}
