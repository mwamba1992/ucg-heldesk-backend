import { UserRole } from '../../../common/enums';
export declare class User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: UserRole;
    department: string;
    location: string;
    ldapDn: string;
    isActive: boolean;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
