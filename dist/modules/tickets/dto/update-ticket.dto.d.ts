import { Priority, TicketStatus } from '../../../common/enums';
export declare class UpdateTicketDto {
    title?: string;
    description?: string;
    categoryId?: string;
    priority?: Priority;
    status?: TicketStatus;
    location?: string;
    assignedTo?: string;
}
