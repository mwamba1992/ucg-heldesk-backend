import { Priority, TicketStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Comment } from './comment.entity';
import { Attachment } from './attachment.entity';
export declare class Ticket {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    categoryId: string;
    category: Category;
    priority: Priority;
    status: TicketStatus;
    requesterId: string;
    requester: User;
    assignedTo: string;
    assignee: User;
    location: string;
    slaDueAt: Date;
    firstResponseAt: Date;
    resolvedAt: Date;
    closedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    comments: Comment[];
    attachments: Attachment[];
}
