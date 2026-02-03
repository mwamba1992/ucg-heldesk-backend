import { Priority } from '../../../common/enums';
export declare class SlaPolicy {
    id: string;
    priority: Priority;
    firstResponseMinutes: number;
    resolutionTargetMinutes: number;
    escalationAfterMinutes: number;
    isActive: boolean;
}
