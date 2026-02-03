import { User } from '../../users/entities/user.entity';
export declare class AuditLog {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValue: Record<string, any>;
    newValue: Record<string, any>;
    performedBy: string;
    performer: User;
    createdAt: Date;
}
