import { User } from '../../users/entities/user.entity';
import { Ticket } from './ticket.entity';
export declare class Comment {
    id: string;
    ticketId: string;
    ticket: Ticket;
    authorId: string;
    author: User;
    body: string;
    isInternal: boolean;
    createdAt: Date;
}
